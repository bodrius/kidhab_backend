import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import * as faker from 'faker';
import { AppModule } from '@src/app.module';
import { configureApp } from '@src/configure-app';
import {
  FixturesService,
  FamilyFixtures,
  HabitsFixtures,
} from '@src/shared/fixtures/fixtures.service';
import { Repository, Connection } from 'typeorm';
import { HabitEntity } from '../common/habit.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateHabitDto } from '../common/dto/create-habit.dto';
import { UpdateHabitGqlDto } from '../common/dto/update-habit.dto';
import { NotificationForParentEntity } from '@src/modules/notifications/notifications-for-parent/common/notification-for-parent.entity';
import { ParentNotificationsTypes } from '@src/shared/interfaces/parent-notifications-types.enum';
import { HabitsStatuses } from '../common/habits-statuses.enum';

describe('Habits For Child Resolver (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let habitsRepository: Repository<HabitEntity>;
  let notificationsForParentRepository: Repository<NotificationForParentEntity>;
  let fixturesService: FixturesService;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    fixturesService = moduleFixture.get(FixturesService);
    habitsRepository = moduleFixture.get(getRepositoryToken(HabitEntity));
    notificationsForParentRepository = moduleFixture.get(
      getRepositoryToken(NotificationForParentEntity),
    );
    connection = moduleFixture.get(Connection);

    await app.init();
    const server = app.getHttpServer();
    request = supertest(server);
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('MUTATION createChildHabitFromDraft', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let habitsFixtures: HabitsFixtures;
    let createdHabit: HabitEntity;
    let createdNotificationForParent: NotificationForParentEntity;

    let mutationArgs: CreateHabitDto;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      habitsFixtures = await fixturesService.createHabitsFixtures({
        child: familyFixtures.child,
      });

      mutationArgs = {
        name: faker.random.words(),
        description: faker.random.words(),
        points: faker.random.number(100),
        reccurence: '1 days',
        baseDate: faker.date.recent().toISOString(),
        timesToComplete: faker.random.number(10),
        categoryId: habitsFixtures.category.id,
      };

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.childToken}`)
        .send({
          query: `mutation {
          createChildHabitFromDraft(
            categoryId: "${mutationArgs.categoryId}"
            name: "${mutationArgs.name}"
            description: "${mutationArgs.description}"
            points: ${mutationArgs.points}
            reccurence: "${mutationArgs.reccurence}"
            baseDate: "${mutationArgs.baseDate}"
            timesToComplete: ${mutationArgs.timesToComplete}
          ) {
            id
            name
            points
            child {
              id
            }
            category {
              id
            }
            draft {
              name
              description
              points
              reccurence
              timesToComplete
              categoryId
              baseDate
            }
          }
        }`,
        });

      [createdHabit] = await habitsRepository.find({
        child: familyFixtures.child,
      });
      createdNotificationForParent = await notificationsForParentRepository.findOne(
        { childAuthor: { id: familyFixtures.child.id } },
      );
    });

    afterAll(async () => {
      await notificationsForParentRepository.remove(
        createdNotificationForParent,
      );
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should create habits in DB', () => {
      expect(createdHabit).toBeTruthy();
    });

    it('should create parent notification in DB', () => {
      expect(createdNotificationForParent).toBeTruthy();
      expect(createdNotificationForParent).toMatchObject({
        type: ParentNotificationsTypes.HABIT_CREATION_REQUESTED,
      });
    });

    it('should return expected result', () => {
      const {
        name,
        description,
        points,
        reccurence,
        timesToComplete,
        categoryId,
        baseDate,
      } = mutationArgs;

      const expectedResponseBody = {
        data: {
          createChildHabitFromDraft: {
            id: createdHabit.id,
            name: null,
            points: null,
            child: {
              id: familyFixtures.child.id,
            },
            category: null,
            draft: {
              name,
              description,
              points,
              reccurence,
              timesToComplete,
              categoryId,
              baseDate,
            },
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION updateChildHabitDraft', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let habitsFixtures: HabitsFixtures;
    let updatedHabit: HabitEntity;
    let createdNotificationForParent: NotificationForParentEntity;

    let mutationArgs: UpdateHabitGqlDto;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      habitsFixtures = await fixturesService.createHabitsFixtures({
        child: familyFixtures.child,
        habits: true,
      });

      mutationArgs = {
        name: faker.random.words(),
        description: faker.random.words(),
        points: faker.random.number(100),
      };

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.childToken}`)
        .send({
          query: `mutation {
          updateChildHabitDraft(
            habitId: "${habitsFixtures.habit.id}"
            updateParams: {
              name: "${mutationArgs.name}"
              description: "${mutationArgs.description}"
              points: ${mutationArgs.points}
            }
          ) {
            name
            description
            points
            draft {
              name
              description
              points
            }
          }
        }`,
        });

      [updatedHabit] = await habitsRepository.find({
        child: familyFixtures.child,
      });
      createdNotificationForParent = await notificationsForParentRepository.findOne(
        { habit: { id: habitsFixtures.habit.id } },
      );
    });

    afterAll(async () => {
      await notificationsForParentRepository.remove(
        createdNotificationForParent,
      );
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update habit in DB', () => {
      expect(updatedHabit).toBeTruthy();
      expect(updatedHabit.draft).toMatchObject(mutationArgs);
    });

    it('should create parent notification in DB', () => {
      expect(createdNotificationForParent).toMatchObject({
        type: ParentNotificationsTypes.HABIT_UPDATE_REQUESTED,
      });
    });

    it('should return expected result', () => {
      const { habit } = habitsFixtures;
      const { name, description, points } = mutationArgs;

      const expectedResponseBody = {
        data: {
          updateChildHabitDraft: {
            name: habit.name,
            description: habit.description,
            points: habit.pointsRate,
            draft: {
              name,
              description,
              points,
            },
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION requestHabitDeletion', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let habitsFixtures: HabitsFixtures;
    let updatedHabit: HabitEntity;
    let createdNotificationForParent: NotificationForParentEntity;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      habitsFixtures = await fixturesService.createHabitsFixtures({
        child: familyFixtures.child,
        habits: true,
      });

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.childToken}`)
        .send({
          query: `mutation {
          requestHabitDeletion(
            habitId: "${habitsFixtures.habit.id}"
          ) {
            id
            status
          }
        }`,
        });

      [updatedHabit] = await habitsRepository.find({
        child: familyFixtures.child,
      });
      createdNotificationForParent = await notificationsForParentRepository.findOne(
        { habit: { id: habitsFixtures.habit.id } },
      );
    });

    afterAll(async () => {
      await notificationsForParentRepository.remove(
        createdNotificationForParent,
      );
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update habit in DB', () => {
      expect(updatedHabit).toBeTruthy();
      expect(updatedHabit.status).toEqual(HabitsStatuses.DELETION_REQUESTED);
    });

    it('should create parent notification in DB', () => {
      expect(createdNotificationForParent).toMatchObject({
        type: ParentNotificationsTypes.HABIT_DELETION_REQUESTED,
      });
    });

    it('should return expected result', () => {
      const { habit } = habitsFixtures;

      const expectedResponseBody = {
        data: {
          requestHabitDeletion: {
            id: habit.id,
            status: HabitsStatuses.DELETION_REQUESTED,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });
});
