import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from '@src/app.module';
import { configureApp } from '@src/configure-app';
import {
  FixturesService,
  FamilyFixtures,
  HabitsFixtures,
} from '@src/shared/fixtures/fixtures.service';
import { Connection } from 'typeorm';
import { TaskStatuses } from '../common/task-statuses.enum';

describe('Tasks For Child Resolver (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let fixturesService: FixturesService;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    fixturesService = moduleFixture.get(FixturesService);
    connection = moduleFixture.get(Connection);

    await app.init();
    const server = app.getHttpServer();
    request = supertest(server);
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('QUERY getLoggedChildTasksForDate', () => {
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
        .set('Authorization', `Bearer ${familyFixtures.childToken}`)
        .send({
          query: `query {
            getLoggedChildTasksForDate(
              date: "${habitsFixtures.task.date}"
            ) {
              id
              name
              description
              points
              status
              date
              childId
              habitId
              child {
                id
              }
              habit {
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
      const { task } = habitsFixtures;

      const expectedResponseBody = {
        data: {
          getLoggedChildTasksForDate: [
            {
              id: task.id,
              name: task.name,
              description: task.description,
              points: habitsFixtures.habit.pointsRate,
              status: task.status,
              date: task.date,
              childId: familyFixtures.child.id,
              habitId: habitsFixtures.habit.id,
              child: {
                id: familyFixtures.child.id,
              },
              habit: {
                id: habitsFixtures.habit.id,
              },
            },
          ],
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION sendTaskForApproval', () => {
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
        .set('Authorization', `Bearer ${familyFixtures.childToken}`)
        .send({
          query: `mutation {
            sendTaskForApproval(
              taskId: "${habitsFixtures.task.id}"
            ) {
              id
              status
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
      const { task } = habitsFixtures;

      const expectedResponseBody = {
        data: {
          sendTaskForApproval: {
            id: task.id,
            status: TaskStatuses.PENDING_APPROVAL,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });
});
