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
import { ChildEntity } from '../common/child.entity';
import { Genders } from '../common/gender.enum';
import { Languages } from '@src/shared/interfaces/languages.enum';

describe('Children Resolver (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let fixturesService: FixturesService;
  let childrenRepository: Repository<ChildEntity>;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    fixturesService = moduleFixture.get(FixturesService);
    childrenRepository = moduleFixture.get(getRepositoryToken(ChildEntity));
    connection = moduleFixture.get(Connection);

    await app.init();
    const server = app.getHttpServer();
    request = supertest(server);
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('MUTATION createChild', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let createdChild: ChildEntity;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures(false);

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
            createChild(
              username: "${faker.name.firstName()}"
              age: ${faker.random.number(20)}
              gender: ${Genders.MALE}
              categoryIds: []
            ) {
              id
              username
            }
          }`,
        });

      [createdChild] = await childrenRepository.find({
        family: familyFixtures.family,
      });
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should create child in DB', () => {
      expect(createdChild).toBeTruthy();
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          createChild: {
            id: createdChild.id,
            username: createdChild.username,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('QUERY children', () => {
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
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `query {
          children {
            id
            username
            balance
            habits {
              id
            }
            family {
              id
            }
            familyId
            categories {
              id
              name
            }
            awards {
              id
              name
              description
              type
              cost
              isActive
              imageUrl
              draft {
                name
              }
              childId
              child {
                id
              }
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
      const { child } = familyFixtures;
      const { habit } = habitsFixtures;
      const { award } = awardsFixtures;

      const expectedResponseBody = {
        data: {
          children: [
            {
              id: child.id,
              username: child.username,
              balance: child.balance,
              habits: [
                {
                  id: habit.id,
                },
              ],
              family: {
                id: child.familyId,
              },
              familyId: child.familyId,
              categories: [],
              awards: [
                {
                  id: award.id,
                  name: award.name,
                  description: award.description,
                  type: award.type,
                  cost: award.cost,
                  isActive: award.isActive,
                  imageUrl: award.imageUrl,
                  draft: null,
                  childId: child.id,
                  child: {
                    id: child.id,
                  },
                },
              ],
            },
          ],
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION upsertInviteHashForChild', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let updatedChild: ChildEntity;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
          upsertInviteHashForChild(
            childId: "${familyFixtures.child.id}"
          ) {
            id
            username
            inviteHash
          }
        }`,
        });

      updatedChild = await childrenRepository.findOne(familyFixtures.child.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update child in DB', () => {
      expect(updatedChild.inviteHash).toBeTruthy();
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          upsertInviteHashForChild: {
            id: updatedChild.id,
            username: updatedChild.username,
            inviteHash: updatedChild.inviteHash,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION updateLoggedChild', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let updatedChild: ChildEntity;

    const newLanguage = Languages.UA;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.childToken}`)
        .send({
          query: `mutation {
          updateLoggedChild(
            language: ${newLanguage}
          ) {
            id
            language
          }
        }`,
        });

      updatedChild = await childrenRepository.findOne(familyFixtures.child.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update child in DB', () => {
      expect(updatedChild).toMatchObject({ language: newLanguage });
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          updateLoggedChild: {
            id: updatedChild.id,
            language: newLanguage,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });
});
