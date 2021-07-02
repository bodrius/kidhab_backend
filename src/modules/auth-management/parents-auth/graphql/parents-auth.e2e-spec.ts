import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as faker from 'faker';
import * as supertest from 'supertest';
import { AppModule } from '@src/app.module';
import { configureApp } from '@src/configure-app';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ParentsRepository } from '@src/modules/parents/common/parents.repository';
import { SessionsRepository } from '@src/modules/sessions/sessions.repository';
import { Repository, Connection } from 'typeorm';
import { FamilyEntity } from '@src/modules/families/common/family.entity';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import {
  FixturesService,
  FamilyFixtures,
} from '@src/shared/fixtures/fixtures.service';
import { SessionEntity } from '@src/modules/sessions/session.entity';
import { Languages } from '@src/shared/interfaces/languages.enum';

describe('Parents Auth Resolver (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let parentsRepository: ParentsRepository;
  let sessionsRepository: SessionsRepository;
  let familiesRepository: Repository<FamilyEntity>;
  let fixturesService: FixturesService;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    parentsRepository = moduleFixture.get(
      getRepositoryToken(ParentsRepository),
    );
    sessionsRepository = moduleFixture.get(
      getRepositoryToken(SessionsRepository),
    );
    familiesRepository = moduleFixture.get(getRepositoryToken(FamilyEntity));
    fixturesService = moduleFixture.get(FixturesService);
    connection = moduleFixture.get(Connection);

    await app.init();
    const server = app.getHttpServer();
    request = supertest(server);
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('MUTATION parentSignUp', () => {
    const email = Date.now() + faker.internet.email();
    const password = faker.random.words();

    let response: supertest.Response;
    let createdParent: ParentEntity;

    beforeAll(async () => {
      response = await request.post('/graphql').send({
        query: `mutation {
          parentSignUp(
            email: "${email}"
            password: "${password}"
          ) {
            parent {
              id
              email
              language
              family {
                id
              }
            }
            token
          }
        }`,
      });

      createdParent = await parentsRepository.findOne({ email });
    });

    afterAll(async () => {
      await sessionsRepository.delete({ parent: createdParent });
      await parentsRepository.remove(createdParent);
      await familiesRepository.delete({ id: createdParent.familyId });
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should create new parent', () => {
      expect(createdParent).toBeTruthy();
    });

    it('should create new family', async () => {
      const createdFamily = await familiesRepository.findOne(
        createdParent.familyId,
      );
      expect(createdFamily).toBeTruthy();
    });

    it('should create new session', async () => {
      const createdSession = await sessionsRepository.findOne({
        parent: createdParent,
      });
      expect(createdSession).toBeTruthy();
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          parentSignUp: {
            parent: {
              id: createdParent.id,
              email: createdParent.email,
              language: Languages.RU,
              family: {
                id: createdParent.familyId,
              },
            },
          },
        },
      };

      expect(response.body).toMatchObject(expectedResponseBody);
      expect(typeof response.body.data.parentSignUp.token).toEqual('string');
    });
  });

  describe('MUTATION parentSignIn', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let newSession: SessionEntity;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();

      response = await request.post('/graphql').send({
        query: `mutation {
          parentSignIn(
            email: "${familyFixtures.parent.email}"
            password: "${familyFixtures.parentPassword}"
          ) {
            parent {
              id
              email
              family {
                id
              }
            }
            token
          }
        }`,
      });

      newSession = await sessionsRepository.findOne({
        parent: familyFixtures.parent,
      });
    });

    afterAll(async () => {
      await sessionsRepository.remove(newSession);
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should create new session', async () => {
      expect(newSession).toBeTruthy();
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          parentSignIn: {
            parent: {
              id: familyFixtures.parent.id,
              email: familyFixtures.parent.email,
              family: {
                id: familyFixtures.parent.familyId,
              },
            },
          },
        },
      };

      expect(response.body).toMatchObject(expectedResponseBody);
      expect(typeof response.body.data.parentSignIn.token).toEqual('string');
    });
  });

  describe('MUTATION setParentDeviceToken', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;

    const deviceToken = faker.random.uuid();

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
            setParentDeviceToken(
              deviceToken: "${deviceToken}"
            ) {
              success
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

    it('should save deviceToken in DB', async () => {
      const updatedSession = await sessionsRepository.findOne(
        familyFixtures.parentSession.id,
      );
      expect(updatedSession.deviceToken).toEqual(deviceToken);
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          setParentDeviceToken: {
            success: true,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION logOutParent', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
            logOutParent {
              success
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

    it('should remove session from DB', async () => {
      const removedSession = await sessionsRepository.findOne(
        familyFixtures.parentSession.id,
      );
      expect(removedSession).toBeFalsy();
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          logOutParent: {
            success: true,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });
});
