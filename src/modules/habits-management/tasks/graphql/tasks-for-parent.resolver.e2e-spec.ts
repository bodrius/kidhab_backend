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
import { Connection, Repository } from 'typeorm';
import { CreateOneTimeTaskDto } from './dto/create-one-time-task.dto';
import { TaskEntity } from '../common/task.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskStatuses } from '../common/task-statuses.enum';
import { UpdateOneTimeTaskGqlDto } from './dto/update-one-time-task.dto';
import { StatusesForReview } from './dto/review-task.dto';
import { ChildrenRepository } from '@src/modules/children/common/children.repository';

describe('Tasks For Parent Resolver (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let fixturesService: FixturesService;
  let tasksRepository: Repository<TaskEntity>;
  let childrenRepository: ChildrenRepository;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    fixturesService = moduleFixture.get(FixturesService);
    tasksRepository = moduleFixture.get(getRepositoryToken(TaskEntity));
    childrenRepository = moduleFixture.get(ChildrenRepository);
    connection = moduleFixture.get(Connection);

    await app.init();
    const server = app.getHttpServer();
    request = supertest(server);
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('QUERY getChildTasksForDate', () => {
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
            getChildTasksForDate(
              childId: "${familyFixtures.child.id}"
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
          getChildTasksForDate: [
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

  describe('MUTATION createOneTimeTask', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let createdTask: TaskEntity;

    const mutationArgs: CreateOneTimeTaskDto = {
      name: faker.random.word(),
      description: faker.random.words(),
      points: faker.random.number(100),
      date: faker.date.recent().toISOString(),
    };

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
            createOneTimeTask(
              childId: "${familyFixtures.child.id}"
              createOneTimeTaskParams: {
                name: "${mutationArgs.name}"
                description: "${mutationArgs.description}"
                points: ${mutationArgs.points}
                date: "${mutationArgs.date}"
              }
            ) {
              id
              status
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

      createdTask = await tasksRepository.findOne({
        child: { id: familyFixtures.child.id },
      });
    });

    afterAll(async () => {
      await tasksRepository.remove(createdTask);
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should create one-time task in DB', () => {
      expect(createdTask).toBeTruthy();
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          createOneTimeTask: {
            id: createdTask.id,
            status: TaskStatuses.CREATED,
            childId: familyFixtures.child.id,
            habitId: null,
            child: {
              id: familyFixtures.child.id,
            },
            habit: null,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION updateOneTimeTask', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let updatedTask: TaskEntity;

    const mutationArgs: UpdateOneTimeTaskGqlDto = {
      name: faker.random.word(),
    };

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      const taskToUpdate = await tasksRepository.save({
        name: faker.random.word(),
        description: faker.random.words(),
        totalPoints: faker.random.number(),
        date: faker.date.recent().toISOString(),
        child: familyFixtures.child,
      });

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
            updateOneTimeTask(
              taskId: "${taskToUpdate.id}"
              updateOneTimeTaskParams: {
                name: "${mutationArgs.name}"
              }
            ) {
              id
              name
            }
          }`,
        });

      updatedTask = await tasksRepository.findOne(taskToUpdate.id);
    });

    afterAll(async () => {
      await tasksRepository.remove(updatedTask);
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update one-time task in DB', () => {
      expect(updatedTask).toMatchObject(mutationArgs);
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          updateOneTimeTask: {
            id: updatedTask.id,
            name: mutationArgs.name,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION deleteOneTimeTask', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let removedTask: TaskEntity;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      const taskToRemove = await tasksRepository.save({
        name: faker.random.word(),
        description: faker.random.words(),
        totalPoints: faker.random.number(),
        date: faker.date.recent().toISOString(),
        child: familyFixtures.child,
      });

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
            deleteOneTimeTask(
              taskId: "${taskToRemove.id}"
            ) {
              success
            }
          }`,
        });

      removedTask = await tasksRepository.findOne(taskToRemove.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should remove one-time task from DB', () => {
      expect(removedTask).toBeFalsy();
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          deleteOneTimeTask: {
            success: true,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION reviewTask', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let habitsFixtures: HabitsFixtures;
    let approvedTask: TaskEntity;
    let initialChildBalance: number;

    const taskPoints = faker.random.number(100);

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      habitsFixtures = await fixturesService.createHabitsFixtures({
        child: familyFixtures.child,
        habits: true,
      });
      await tasksRepository.update(
        { id: habitsFixtures.task.id },
        { status: TaskStatuses.PENDING_APPROVAL, totalPoints: taskPoints },
      );

      initialChildBalance = familyFixtures.child.balance;

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
            reviewTask(
              taskId: "${habitsFixtures.task.id}"
              reviewTaskParams: {
                status: ${StatusesForReview.APPROVED}
              }
            ) {
              id
              status
            }
          }`,
        });

      approvedTask = await tasksRepository.findOne(habitsFixtures.task.id);
    });

    afterAll(async () => {
      await tasksRepository.remove(approvedTask);
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update one-time task in DB', () => {
      expect(approvedTask).toBeTruthy();
      expect(approvedTask).toMatchObject({
        status: TaskStatuses.APPROVED,
      });
    });

    it('should add points to child balance', async () => {
      const child = await childrenRepository.findOne(familyFixtures.child.id);
      expect(child).toBeTruthy();
      expect(child.balance).toEqual(initialChildBalance + taskPoints);
    });

    it('should return expected result', () => {
      const { task } = habitsFixtures;

      const expectedResponseBody = {
        data: {
          reviewTask: {
            id: task.id,
            status: TaskStatuses.APPROVED,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });
});
