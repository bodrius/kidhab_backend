import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import * as faker from 'faker';
import { AppModule } from '@src/app.module';
import { configureApp } from '@src/configure-app';
import {
  FixturesService,
  FamilyFixtures,
  AwardsFixtures,
} from '@src/shared/fixtures/fixtures.service';
import { AwardEntity } from '../common/award.entity';
import { Connection } from 'typeorm';
import { CreateAwardRequestDto } from '../common/dto/create-award-request.dto';
import { AwardTypes } from '../../award-types.enum';
import { UpdateAwardGqlDto } from '../common/dto/update-award.dto';
import { AwardsRepository } from '../common/awards.repository';
import { ChildrenRepository } from '@src/modules/children/common/children.repository';
import { AwardStatuses } from '../common/award-statuses.enum';

describe('Awards For Child Resolver (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let fixturesService: FixturesService;
  let awardsRepository: AwardsRepository;
  let childrenRepository: ChildrenRepository;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    fixturesService = moduleFixture.get(FixturesService);
    awardsRepository = moduleFixture.get(AwardsRepository);
    childrenRepository = moduleFixture.get(ChildrenRepository);
    connection = moduleFixture.get(Connection);

    await app.init();
    const server = app.getHttpServer();
    request = supertest(server);
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('MUTATION createAwardFromDraft', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let createdAward: AwardEntity;

    const mutationArgs: CreateAwardRequestDto = {
      name: faker.random.words(),
      description: faker.random.words(),
      cost: faker.random.number(500),
      type: AwardTypes.MATERIAL,
    };

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.childToken}`)
        .send({
          query: `mutation {
            createAwardFromDraft(
              name: "${mutationArgs.name}"
              description: "${mutationArgs.description}"
              cost: ${mutationArgs.cost}
              type: ${mutationArgs.type}
            ) {
              id
              name
              description
              cost
              type
              draft {
                name
                description
                cost
                type
              }
            }
          }`,
        });

      createdAward = await awardsRepository.findOne({
        child: familyFixtures.child,
      });
    });

    afterAll(async () => {
      await awardsRepository.remove(createdAward);
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should create award in DB', () => {
      expect(createdAward).toBeTruthy();
      expect(createdAward.draft).toEqual(mutationArgs);
    });

    it('should return expected result', () => {
      const { id } = createdAward;

      const expectedResponseBody = {
        data: {
          createAwardFromDraft: {
            id,
            name: null,
            description: null,
            cost: null,
            type: null,
            draft: {
              name: mutationArgs.name,
              description: mutationArgs.description,
              cost: mutationArgs.cost,
              type: mutationArgs.type,
            },
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION updateAwardDraft', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let awardsFixtures: AwardsFixtures;
    let updatedAward: AwardEntity;

    const mutationArgs: UpdateAwardGqlDto = {
      name: faker.random.words(),
    };

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      awardsFixtures = await fixturesService.createAwardsFixtures(
        familyFixtures.child,
      );

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.childToken}`)
        .send({
          query: `mutation {
            updateAwardDraft(
              awardId: "${awardsFixtures.award.id}"
              updateAwardParams: {
                name: "${mutationArgs.name}"
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
      await awardsRepository.remove(updatedAward);
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update award in DB', () => {
      expect(updatedAward).toBeTruthy();
      expect(updatedAward.draft).toMatchObject(mutationArgs);
    });

    it('should return expected result', () => {
      const { award } = awardsFixtures;

      const expectedResponseBody = {
        data: {
          updateAwardDraft: {
            id: award.id,
            name: award.name,
            draft: {
              name: mutationArgs.name,
            },
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION deleteLoggedChildAward', () => {
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
        .set('Authorization', `Bearer ${familyFixtures.childToken}`)
        .send({
          query: `mutation {
            deleteLoggedChildAward(
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
          deleteLoggedChildAward: {
            success: true,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });

  describe('MUTATION purchaseAward', () => {
    let response: supertest.Response;
    let familyFixtures: FamilyFixtures;
    let awardsFixtures: AwardsFixtures;
    let purchasedAward: AwardEntity;

    beforeAll(async () => {
      familyFixtures = await fixturesService.createFamilyFixtures();
      awardsFixtures = await fixturesService.createAwardsFixtures(
        familyFixtures.child,
      );
      await childrenRepository.update(
        { id: familyFixtures.child.id },
        { balance: awardsFixtures.award.cost },
      );

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${familyFixtures.childToken}`)
        .send({
          query: `mutation {
            purchaseAward(
              awardId: "${awardsFixtures.award.id}"
            ) {
              id
              status
            }
          }`,
        });

      purchasedAward = await awardsRepository.findOne(awardsFixtures.award.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should mark award as purchased in DB', () => {
      expect(purchasedAward).toMatchObject({ status: AwardStatuses.PURCHASED });
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          purchaseAward: {
            id: awardsFixtures.award.id,
            status: AwardStatuses.PURCHASED,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });
});
