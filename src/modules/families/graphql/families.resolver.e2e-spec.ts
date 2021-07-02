import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from '@src/app.module';
import { configureApp } from '@src/configure-app';
import {
  FixturesService,
  FamilyFixtures,
  HabitsFixtures,
  AwardsFixtures,
} from '@src/shared/fixtures/fixtures.service';
import { Connection } from 'typeorm';

describe('Families Resolver (e2e)', () => {
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

  describe('QUERY getFamily', () => {
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
          getFamily {
            id
            accountType
            subscriptionId
            subscriptionExpiresAt
            children {
              id
              username
            }
            parents {
              id
              email
            }
            awardTemplates {
              id
              name
            }
            habitTemplates {
              id
              name
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
          getFamily: {
            id: familyFixtures.family.id,
            accountType: familyFixtures.family.accountType,
            subscriptionId: familyFixtures.family.subscriptionId,
            subscriptionExpiresAt: familyFixtures.family.subscriptionExpiresAt,
            parents: [
              {
                id: familyFixtures.parent.id,
                email: familyFixtures.parent.email,
              },
            ],
            children: [
              {
                id: familyFixtures.child.id,
                username: familyFixtures.child.username,
              },
            ],
            habitTemplates: [
              {
                id: habitsFixtures.template.id,
                name: habitsFixtures.template.name,
              },
            ],
            awardTemplates: [
              {
                id: awardsFixtures.template.id,
                name: awardsFixtures.template.name,
              },
            ],
          },
        },
      };

      expect(response.body).toEqual(expectedResponseBody);
    });
  });
});
