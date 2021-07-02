import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '@src/app.module';
import { configureApp } from '@src/configure-app';
import {
  FixturesService,
  FamilyFixtures,
  HabitsFixtures,
  AwardsFixtures,
} from '@src/shared/fixtures/fixtures.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { ChildStatuses } from '@src/modules/children/common/child-statuses.enum';
import { AuthBaseService } from '@src/modules/auth-management/auth-base/auth-base.service';
import { SessionEntity } from '@src/modules/sessions/session.entity';

describe('Children Auth Resolver (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let fixturesService: FixturesService;
  let childrenRepository: Repository<ChildEntity>;
  let authBaseService: AuthBaseService;
  let sessionsRepository: Repository<SessionEntity>;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    configureApp(app);

    fixturesService = moduleFixture.get(FixturesService);
    childrenRepository = moduleFixture.get(getRepositoryToken(ChildEntity));
    sessionsRepository = moduleFixture.get(getRepositoryToken(SessionEntity));
    authBaseService = moduleFixture.get(AuthBaseService);
    connection = moduleFixture.get(Connection);

    await app.init();
    const server = app.getHttpServer();
    request = supertest(server);
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('QUERY getLoggedChild', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let habitsFixtures: HabitsFixtures;
    let awardsFixtures: AwardsFixtures;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      habitsFixtures = await fixturesService.createHabitsFixtures({
        child: familyFixtures.child,
        habits: true,
      });
      awardsFixtures = await fixturesService.createAwardsFixtures(
        familyFixtures.child,
      );

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.childToken}`)
        .send({
          query: `query {
            getLoggedChild {
              id
              family {
                id
              }
              habits {
                id
              }
              awards {
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
      const expectedResponseBody = {
        data: {
          getLoggedChild: {
            id: familyFixtures.child.id,
            family: { id: familyFixtures.family.id },
            habits: [{ id: habitsFixtures.habit.id }],
            awards: [{ id: awardsFixtures.award.id }],
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION activateChild', () => {
    let response: supertest.Response;
    let fixtures: FamilyFixtures;
    let activatedChild: ChildEntity;

    const inviteHash = faker.random.uuid();

    beforeAll(async () => {
      fixtures = await fixturesService.createFamilyFixtures();

      await childrenRepository.update(
        { id: fixtures.child.id },
        { inviteHash },
      );

      response = await request.post('/graphql').send({
        query: `mutation {
            activateChild(
              inviteHash: "${inviteHash}"
            ) {
              child {
                id
                status
              }
              token
            }
          }`,
      });

      activatedChild = await childrenRepository.findOne(fixtures.child.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update child in DB', () => {
      expect(activatedChild).toMatchObject({
        status: ChildStatuses.ACTIVATED,
        inviteHash: null,
      });
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          activateChild: {
            child: { id: fixtures.child.id, status: ChildStatuses.ACTIVATED },
          },
        },
      };

      expect(response.body).toMatchObject(expectedResponseBody);
      expect(response.body.data.activateChild.token).toBeTruthy();
    });

    it('should create new session in DB', async () => {
      const { token } = response.body.data.activateChild;
      const { sid } = jwt.decode(token);
      const newSession = await sessionsRepository.findOne({
        where: { id: sid },
        relations: ['child'],
      });

      expect(newSession).toBeTruthy();
      expect(newSession.child.id).toEqual(fixtures.child.id);
    });
  });

  describe('MUTATION setChildCreds', () => {
    let response: supertest.Response;
    let fixtures: FamilyFixtures;
    let updatedChild: ChildEntity;

    const newEmail = Date.now() + faker.internet.email();
    const newPassword = faker.random.words();

    beforeAll(async () => {
      fixtures = await fixturesService.createFamilyFixtures();

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${fixtures.childToken}`)
        .send({
          query: `mutation {
            setChildCreds(
              email: "${newEmail}"
              password: "${newPassword}"
            ) {
              id
              email
            }
          }`,
        });

      updatedChild = await childrenRepository.findOne(fixtures.child.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update child in DB', () => {
      expect(updatedChild.email).toEqual(newEmail);
      expect(typeof updatedChild.passwordHash).toEqual('string');
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          setChildCreds: {
            id: fixtures.child.id,
            email: newEmail,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION childSignIn', () => {
    let response: supertest.Response;
    let fixtures: FamilyFixtures;

    const email = Date.now() + faker.internet.email();
    const password = faker.random.words();

    beforeAll(async () => {
      fixtures = await fixturesService.createFamilyFixtures();
      await childrenRepository.update(
        { id: fixtures.child.id },
        { email, passwordHash: await authBaseService.createPasswordHash(password) },
      );

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${fixtures.childToken}`)
        .send({
          query: `mutation {
            childSignIn(
              email: "${email}"
              password: "${password}"
            ) {
              child {
                id
              }
              token
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
      const expectedResponseBody = {
        data: {
          childSignIn: {
            child: { id: fixtures.child.id },
          },
        },
      };

      expect(response.body).toMatchObject(expectedResponseBody);
      expect(response.body.data.childSignIn.token).toBeTruthy();
    });

    it('should create session in DB', async () => {
      const { token } = response.body.data.childSignIn;
      const { sid } = jwt.decode(token);
      const newSession = await sessionsRepository.findOne({
        where: { id: sid },
        relations: ['child'],
      });

      expect(newSession).toBeTruthy();
      expect(newSession.child.id).toEqual(fixtures.child.id);
    });
  });

  describe('MUTATION setChildDeviceToken', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;

    const deviceToken = faker.random.uuid();

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.childToken}`)
        .send({
          query: `mutation {
            setChildDeviceToken(
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
        familyFixtures.childSession.id,
      );
      expect(updatedSession.deviceToken).toEqual(deviceToken);
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          setChildDeviceToken: {
            success: true,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION logOutChild', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.childToken}`)
        .send({
          query: `mutation {
            logOutChild {
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
        familyFixtures.childSession.id,
      );
      expect(removedSession).toBeFalsy();
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          logOutChild: {
            success: true,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });
});
