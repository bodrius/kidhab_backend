import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from '@src/app.module';
import { configureApp } from '@src/configure-app';
import { Connection } from 'typeorm';
import {
  FixturesService,
  FamilyFixtures,
  HabitsFixtures,
} from '@src/shared/fixtures/fixtures.service';

describe('Habits Resolver (e2e)', () => {
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

  describe('QUERY habitCategories', () => {
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
          habitCategories {
            id
            name
            templates {
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
      const expectedResult = {
        id: habitsFixtures.category.id,
        name: habitsFixtures.category.name,
        templates: [
          {
            id: habitsFixtures.template.id,
          },
        ],
      };

      expect(response?.body?.data).toBeTruthy();
      expect(response.body.data?.habitCategories).toBeTruthy();
      expect(response.body.data.habitCategories).toContainEqual(expectedResult);
    });
  });
});
