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
import { HabitsStatuses } from '../common/habits-statuses.enum';
import { ReviewAwardDraftDto } from '@src/modules/awards-management/awards/common/dto/review-award-draft.dto';

describe('Habits For Parent Resolver (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let habitsRepository: Repository<HabitEntity>;
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
    connection = moduleFixture.get(Connection);

    await app.init();
    const server = app.getHttpServer();
    request = supertest(server);
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('MUTATION createChildHabits', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let habitsFixtures: HabitsFixtures;
    let createdHabit: HabitEntity;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      habitsFixtures = await fixturesService.createHabitsFixtures({
        child: familyFixtures.child,
      });

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
          createChildHabits(
            childId: "${familyFixtures.child.id}"
            habits: [{
              categoryId: "${habitsFixtures.category.id}"
              name: "${faker.random.words()}"
              description: "${faker.random.words()}"
              points: ${faker.random.number(20)}
              reccurence: "1 day"
              baseDate: "${faker.date.recent().toISOString()}"
            }]
          ) {
            id
            name
            points
            child {
              id
              username
            }
            category {
              id
            }
          }
        }`,
        });

      [createdHabit] = await habitsRepository.find({
        child: familyFixtures.child,
      });
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should create habits in DB', () => {
      expect(createdHabit).toBeTruthy();
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          createChildHabits: [
            {
              id: createdHabit.id,
              name: createdHabit.name,
              points: createdHabit.points,
              child: {
                id: familyFixtures.child.id,
                username: familyFixtures.child.username,
              },
              category: {
                id: habitsFixtures.category.id,
              },
            },
          ],
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('QUERY getChildHabits', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let habitsFixtures: HabitsFixtures;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      habitsFixtures = await fixturesService.createHabitsFixtures({
        child: familyFixtures.child,
        habits: true,
      });

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `query {
            getChildHabits(
              childId: "${familyFixtures.child.id}"
            ) {
              id
              name
              description
              points
              status
              reccurence
              baseDate
              timesToComplete
              timesToCompleteLevel
              timesToCompleteLevelLeft
              habitLevel
              categoryId
              childId
              draft {
                name
              }
              child {
                id
                username
              }
              category {
                id
              }
            }
          }`,
        });
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should return expected result', () => {
      const {
        id,
        name,
        description,
        pointsRate,
        status,
        reccurence,
        baseDate,
        timesToComplete,
        categoryId,
        childId,
        timesToCompleteLevel,
        timesToCompleteLevelLeft,
        habitLevel,
      } = habitsFixtures.habit;

      const expectedResponseBody = {
        data: {
          getChildHabits: [
            {
              id,
              name,
              description,
              points: pointsRate,
              status,
              reccurence,
              baseDate,
              timesToComplete,
              timesToCompleteLevel,
              timesToCompleteLevelLeft,
              habitLevel,
              categoryId,
              childId,
              draft: null,
              child: {
                id: familyFixtures.child.id,
                username: familyFixtures.child.username,
              },
              category: {
                id: habitsFixtures.category.id,
              },
            },
          ],
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION updateChildHabit', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let habitsFixtures: HabitsFixtures;
    let updatedHabit: HabitEntity;

    const newName = faker.random.words();
    const newDescription = faker.random.words();

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      habitsFixtures = await fixturesService.createHabitsFixtures({
        child: familyFixtures.child,
        habits: true,
      });

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
          updateChildHabit(
            habitId: "${habitsFixtures.habit.id}"
            fields: {
              name: "${newName}"
              description: "${newDescription}"
            }
          ) {
            id
            name
            description
            points
          }
        }`,
        });

      updatedHabit = await habitsRepository.findOne(habitsFixtures.habit.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update habit in DB', () => {
      expect(updatedHabit.name).toEqual(newName);
    });

    it('should return expected result', () => {
      const { id, pointsRate } = habitsFixtures.habit;

      const expectedResponseBody = {
        data: {
          updateChildHabit: {
            id,
            name: newName,
            description: newDescription,
            points: pointsRate,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION reviewHabitDraft', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let habitsFixtures: HabitsFixtures;
    let updatedHabit: HabitEntity;

    const habitDraft = {
      name: faker.random.word(),
      description: faker.random.words(),
    };

    const mutationArgs: ReviewAwardDraftDto = {
      approve: true,
    };

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      habitsFixtures = await fixturesService.createHabitsFixtures({
        child: familyFixtures.child,
        habits: true,
      });
      await habitsRepository.update(
        { id: habitsFixtures.habit.id },
        { draft: habitDraft },
      );

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
          reviewHabitDraft(
            habitId: "${habitsFixtures.habit.id}"
            habitApprovalParams: {
              approve: ${mutationArgs.approve}
            }
          ) {
            id
            name
            description
            draft {
              name
            }
          }
        }`,
        });

      updatedHabit = await habitsRepository.findOne(habitsFixtures.habit.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update habit in DB', () => {
      expect(updatedHabit).toBeTruthy();
      expect(updatedHabit).toMatchObject({
        name: habitDraft.name,
        description: habitDraft.description,
        draft: null,
      });
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          reviewHabitDraft: {
            id: habitsFixtures.habit.id,
            ...habitDraft,
            draft: null,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION reviewHabitDeletion', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let habitsFixtures: HabitsFixtures;
    let removedHabit: HabitEntity;

    const mutationArgs: ReviewAwardDraftDto = {
      approve: true,
    };

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      habitsFixtures = await fixturesService.createHabitsFixtures({
        child: familyFixtures.child,
        habits: true,
      });
      await habitsRepository.update(
        { id: habitsFixtures.habit.id },
        { status: HabitsStatuses.DELETION_REQUESTED },
      );

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
          reviewHabitDeletion(
            habitId: "${habitsFixtures.habit.id}"
            habitApprovalParams: {
              approve: ${mutationArgs.approve}
            }
          ) {
            id
            status
          }
        }`,
        });

      removedHabit = await habitsRepository.findOne(habitsFixtures.habit.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update habit in DB', () => {
      expect(removedHabit).toBeTruthy();
      expect(removedHabit).toMatchObject({
        status: HabitsStatuses.DELETED,
      });
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          reviewHabitDeletion: {
            id: habitsFixtures.habit.id,
            status: HabitsStatuses.DELETED,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION deleteChildHabit', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let habitsFixtures: HabitsFixtures;
    let removedHabit: HabitEntity;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      habitsFixtures = await fixturesService.createHabitsFixtures({
        child: familyFixtures.child,
        habits: true,
      });

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
            deleteChildHabit(
              habitId: "${habitsFixtures.habit.id}"
            ) {
              success
            }
          }`,
        });

      removedHabit = await habitsRepository.findOne(habitsFixtures.habit.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update habit in DB', () => {
      expect(removedHabit.status).toEqual(HabitsStatuses.DELETED);
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          deleteChildHabit: {
            success: true,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });
});
