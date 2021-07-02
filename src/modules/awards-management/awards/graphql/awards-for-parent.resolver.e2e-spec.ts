import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import context from 'jest-plugin-context';
import * as supertest from 'supertest';
import * as faker from 'faker';
import { AppModule } from '@src/app.module';
import { configureApp } from '@src/configure-app';
import {
  FixturesService,
  FamilyFixtures,
  AwardsFixtures,
} from '@src/shared/fixtures/fixtures.service';
import { AwardTypes } from '../../award-types.enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AwardEntity } from '../common/award.entity';
import { Repository, Connection } from 'typeorm';
import { Genders } from '@src/modules/children/common/gender.enum';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { UpdateAwardGqlDto } from '../common/dto/update-award.dto';
import { ReviewAwardDraftDto } from '../common/dto/review-award-draft.dto';
import { AwardsRepository } from '../common/awards.repository';

describe('Awards For Parent Resolver (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let fixturesService: FixturesService;
  let awardsRepository: AwardsRepository;
  let childrenRepository: Repository<ChildEntity>;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    fixturesService = moduleFixture.get(FixturesService);
    awardsRepository = moduleFixture.get(AwardsRepository);
    childrenRepository = moduleFixture.get(getRepositoryToken(ChildEntity));
    connection = moduleFixture.get(Connection);

    await app.init();
    const server = app.getHttpServer();
    request = supertest(server);
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('MUTATION createAwards', () => {
    context('when input data is not valid', () => {
      it('should return 400 Bad Request', async () => {
        await request
          .post('/graphql')
          .send({
            query: `mutation {
            createAwards() {
              id
            }
          }`,
          })
          .expect(400);
      });
    });

    context('when no token provided', () => {
      let response: supertest.Response;

      beforeAll(async () => {
        response = await request.post('/graphql').send({
          query: `mutation {
            createAwards(
              awards: [{
                name: "${faker.name.title()}"
                description: "${faker.random.words()}"
                type: ${AwardTypes.MATERIAL}
                cost: ${faker.random.number(30)}
                imageUrl: "${faker.internet.url()}"
              }]
            ) {
              id
            }
          }`,
        });
      });

      it('should return 200 OK', () => {
        expect(response.status).toEqual(200);
      });

      it('should return expected result', () => {
        const { body } = response;

        expect(body?.data).toEqual(null);
        expect(body?.errors[0].statusCode).toEqual(401);
      });
    });

    context('when token does not belong to parent', () => {
      let response: supertest.Response;
      let familyFixtures: FamilyFixtures;

      beforeAll(async () => {
        familyFixtures = await fixturesService.createFamilyFixtures();

        response = await request
          .post('/graphql')
          .set('Authorization', `Bearer ${familyFixtures.childToken}`)
          .send({
            query: `mutation {
            createAwards(
              awards: [{
                name: "${faker.name.title()}"
                description: "${faker.random.words()}"
                type: ${AwardTypes.MATERIAL}
                cost: ${faker.random.number(30)}
                imageUrl: "${faker.internet.url()}"
              }]
            ) {
              id
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
        const { body } = response;

        expect(body?.data).toEqual(null);
        expect(body?.errors[0].statusCode).toEqual(401);
      });
    });

    context('when invoked by it own', () => {
      let response: supertest.Response;
      let familyFixtures: FamilyFixtures;
      let createdAward: AwardEntity;

      beforeAll(async () => {
        familyFixtures = await fixturesService.createFamilyFixtures();

        response = await request
          .post('/graphql')
          .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
          .send({
            query: `mutation {
            createAwards(
              childId: "${familyFixtures.child.id}"
              awards: [{
                name: "${faker.name.title()}"
                description: "${faker.random.words()}"
                type: ${AwardTypes.MATERIAL}
                cost: ${faker.random.number(30)}
                imageUrl: "${faker.internet.url()}"
              }]
            ) {
              id
              name
              cost
              child {
                id
                username
              }
              childId
            }
          }`,
          });

        [createdAward] = await awardsRepository.find({
          child: familyFixtures.child,
        });
      });

      afterAll(async () => {
        await fixturesService.clearAll();
      });

      it('should return 200 OK', () => {
        expect(response.status).toEqual(200);
      });

      it('should create awards in DB', () => {
        expect(createdAward).toBeTruthy();
      });

      it('should return expected result', () => {
        const expectedResponseBody = {
          data: {
            createAwards: [
              {
                id: createdAward.id,
                name: createdAward.name,
                cost: createdAward.cost,
                child: {
                  id: familyFixtures.child.id,
                  username: familyFixtures.child.username,
                },
                childId: familyFixtures.child.id,
              },
            ],
          },
        };

        expect(response.body).toEqual(expectedResponseBody);
      });
    });

    context('when invoked after createChildren', () => {
      let response: supertest.Response;
      let familyFixtures: FamilyFixtures;
      let createdAward: AwardEntity;
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
              }

              createAwards(
                awards: [{
                  name: "${faker.name.title()}"
                  description: "${faker.random.words()}"
                  type: ${AwardTypes.MATERIAL}
                  cost: ${faker.random.number(30)}
                  imageUrl: "${faker.internet.url()}"
                }]
              ) {
                id
                name
                cost
                child {
                  id
                  username
                }
                childId
              }
            }`,
          });

        [createdChild] = await childrenRepository.find({
          family: familyFixtures.family,
        });
        [createdAward] = await awardsRepository.find({
          child: createdChild,
        });
      });

      afterAll(async () => {
        await fixturesService.clearAll();
      });

      it('should return 200 OK', () => {
        expect(response.status).toEqual(200);
      });

      it('should create awards in DB', () => {
        expect(createdAward).toBeTruthy();
      });

      it('should return expected result', () => {
        const expectedResponseBody = {
          data: {
            createChild: {
              id: createdChild.id,
            },

            createAwards: [
              {
                id: createdAward.id,
                name: createdAward.name,
                cost: createdAward.cost,
                child: {
                  id: createdChild.id,
                  username: createdChild.username,
                },
                childId: createdChild.id,
              },
            ],
          },
        };

        expect(response.body).toEqual(expectedResponseBody);
      });
    });
  });

  describe('MUTATION updateAward', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let awardsFixtures: AwardsFixtures;
    let updatedAward: AwardEntity;

    const mutationArgs: UpdateAwardGqlDto = {
      name: faker.random.word(),
      cost: faker.random.number(300),
    };

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      awardsFixtures = await fixturesService.createAwardsFixtures(
        familyFixtures.child,
      );

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
            updateAward(
              awardId: "${awardsFixtures.award.id}"
              updateAwardParams: {
                name: "${mutationArgs.name}"
                cost: ${mutationArgs.cost}
              }
            ) {
              id
              name
              cost
            }
          }`,
        });

      updatedAward = await awardsRepository.findOne(awardsFixtures.award.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update award in DB', () => {
      expect(updatedAward).toBeTruthy();
      expect(updatedAward).toMatchObject({
        name: mutationArgs.name,
        cost: mutationArgs.cost,
      });
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          updateAward: {
            ...mutationArgs,
            id: awardsFixtures.award.id,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION reviewAwardDraft', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let awardsFixtures: AwardsFixtures;
    let updatedAward: AwardEntity;

    const mutationArgs: ReviewAwardDraftDto = {
      approve: true,
    };

    const awardDraft = {
      name: faker.random.word(),
    };

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      awardsFixtures = await fixturesService.createAwardsFixtures(
        familyFixtures.child,
      );
      await awardsRepository.update(
        { id: awardsFixtures.award.id },
        { draft: awardDraft },
      );

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
            reviewAwardDraft(
              awardId: "${awardsFixtures.award.id}"
              reviewAwardDraftParams: {
                approve: ${mutationArgs.approve}
              }
            ) {
              id
              name
              draft {
                name
              }
            }
          }`,
        });

      updatedAward = await awardsRepository.findOne(awardsFixtures.award.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update award in DB', () => {
      expect(updatedAward).toBeTruthy();
      expect(updatedAward).toMatchObject({
        name: awardDraft.name,
        draft: null,
      });
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          reviewAwardDraft: {
            id: awardsFixtures.award.id,
            name: awardDraft.name,
            draft: null,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION deleteAward', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let awardsFixtures: AwardsFixtures;
    let removedAward: AwardEntity;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      awardsFixtures = await fixturesService.createAwardsFixtures(
        familyFixtures.child,
      );

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.parentToken}`)
        .send({
          query: `mutation {
            deleteAward(
              awardId: "${awardsFixtures.award.id}"
            ) {
              success
            }
          }`,
        });

      removedAward = await awardsRepository.findOne(awardsFixtures.award.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should remove award in DB', () => {
      expect(removedAward).toBeFalsy();
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          deleteAward: {
            success: true,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });
});
