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
  AwardsFixtures,
} from '@src/shared/fixtures/fixtures.service';
import { Repository, Connection } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationForParentEntity } from '../common/notification-for-parent.entity';
import { ParentNotificationsTypes } from '../../../../shared/interfaces/parent-notifications-types.enum';

describe('Notifications for Parent Resolver (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let fixturesService: FixturesService;
  let notificationsForParentRepository: Repository<NotificationForParentEntity>;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    fixturesService = moduleFixture.get(FixturesService);
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

  describe('QUERY parentNotifications', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let habitsFixtures: HabitsFixtures;
    let awardsFixtures: AwardsFixtures;
    let existingNotifications: NotificationForParentEntity[];

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      habitsFixtures = await fixturesService.createHabitsFixtures({
        child: familyFixtures.child,
        habits: true,
      });
      awardsFixtures = await fixturesService.createAwardsFixtures(
        familyFixtures.child,
      );

      existingNotifications = await notificationsForParentRepository.save([
        {
          parentReceiver: familyFixtures.parent,
          childAuthor: familyFixtures.child,
          type: ParentNotificationsTypes.AWARD_CREATION_REQUESTED,
          description: faker.random.words(),
          award: awardsFixtures.award,
        },
        {
          parentReceiver: familyFixtures.parent,
          childAuthor: familyFixtures.child,
          type: ParentNotificationsTypes.HABIT_CREATION_REQUESTED,
          description: faker.random.words(),
          habit: habitsFixtures.habit,
        },
      ]);

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `query {
            parentNotifications {
              id
              description
              type
              status
              parentReceiverId
              childAuthorId
              habitId
              awardId
              childAuthor {
                id
              }
              parentReceiver {
                id
              }
              habit {
                id
              }
              award {
                id
              }
            }
          }`,
        });
    });

    afterAll(async () => {
      await notificationsForParentRepository.remove(existingNotifications);
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should return expected result', () => {
      const expectedResponseBody = existingNotifications.map(notification => ({
        id: notification.id,
        description: notification.description,
        type: notification.type,
        status: notification.status,
        parentReceiverId: notification.parentReceiverId,
        childAuthorId: notification.childAuthorId,
        habitId: notification.habitId || null,
        awardId: notification.awardId || null,
        childAuthor: {
          id: notification.childAuthorId,
        },
        parentReceiver: {
          id: notification.parentReceiverId,
        },
        habit: notification.habitId ? { id: notification.habitId } : null,
        award: notification.awardId ? { id: notification.awardId } : null,
      }));

      expect(response.body.data.parentNotifications).toContainEqual(
        expectedResponseBody[0],
      );
      expect(response.body.data.parentNotifications).toContainEqual(
        expectedResponseBody[1],
      );
    });
  });

  describe('MUTATION deleteParentNotification', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let habitsFixtures: HabitsFixtures;
    let removedNotification: NotificationForParentEntity;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      habitsFixtures = await fixturesService.createHabitsFixtures({
        child: familyFixtures.child,
        habits: true,
      });

      const notification = await notificationsForParentRepository.save({
        parentReceiver: familyFixtures.parent,
        childAuthor: familyFixtures.child,
        type: ParentNotificationsTypes.HABIT_CREATION_REQUESTED,
        description: faker.random.words(),
        habit: habitsFixtures.habit,
      });

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
            deleteParentNotification(
              notificationId: "${notification.id}"
            ) {
              success
            }
          }`,
        });

      removedNotification = await notificationsForParentRepository.findOne(
        notification.id,
      );
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should remove notification from DB', () => {
      expect(removedNotification).toBeFalsy();
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          deleteParentNotification: { success: true },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });
});
