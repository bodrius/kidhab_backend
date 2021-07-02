import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from '@src/app.module';
import { configureApp } from '@src/configure-app';
import {
  FixturesService,
  FamilyFixtures,
} from '@src/shared/fixtures/fixtures.service';
import { ParentEntity } from '../common/parent.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Languages } from '@src/shared/interfaces/languages.enum';

describe('Parents Resolver (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let fixturesService: FixturesService;
  let parentRepository: Repository<ParentEntity>;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    configureApp(app);

    fixturesService = moduleFixture.get(FixturesService);
    parentRepository = moduleFixture.get(getRepositoryToken(ParentEntity));
    connection = moduleFixture.get(Connection);

    await app.init();
    const server = app.getHttpServer();
    request = supertest(server);
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('MUTATION updateLoggedParent', () => {
    let response: supertest.Response;
    let fixtures: FamilyFixtures;
    let updatedParent: ParentEntity;

    const updatedCountry = faker.address.countryCode();
    const updatedUsername = faker.name.firstName();
    const updatedIsTestPassed = true;
    const updatedLanguage = Languages.EN;

    beforeAll(async () => {
      fixtures = await fixturesService.createFamilyFixtures();

      response = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${fixtures.parentToken}`)
        .send({
          query: `mutation {
            updateLoggedParent(
              isTestPassed: ${updatedIsTestPassed}
              username: "${updatedUsername}"
              country: "${updatedCountry}"
              language: ${updatedLanguage}
            ) {
              id
              isTestPassed
              language
              family {
                id
                accountType
              }
              familyId
            }
          }`,
        });

      updatedParent = await parentRepository.findOne(fixtures.parent.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update parent in DB', () => {
      expect(updatedParent).toMatchObject({
        username: updatedUsername,
        isTestPassed: updatedIsTestPassed,
        country: updatedCountry,
        language: updatedLanguage,
      });
    });

    it('should return expected result', () => {
      const expectedResponseBody = {
        data: {
          updateLoggedParent: {
            id: fixtures.parent.id,
            isTestPassed: updatedIsTestPassed,
            language: updatedLanguage,
            family: {
              id: fixtures.family.id,
              accountType: fixtures.family.accountType,
            },
            familyId: fixtures.family.id,
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });
});
