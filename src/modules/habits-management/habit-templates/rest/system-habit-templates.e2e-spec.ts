import * as faker from 'faker';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from '@src/app.module';
import { configureApp } from '@src/configure-app';
import {
  FixturesService,
  AdminFixtures,
  SystemTemplatesFixtures,
} from '@src/shared/fixtures/fixtures.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminPermissions } from '@src/modules/admin-users/common/permissions.enum';
import { HabitTemplateEntity } from '../common/habit-template.entity';
import { SystemCreateHabitTemplateDto } from '../common/dto/system-create-habit-template.dto';
import { SystemUpdateHabitTemplateDto } from '../common/dto/update-habit-template.dto';

describe('Habit Templates (Administration) Controller (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let fixturesService: FixturesService;
  let habitTemplatesRepository: Repository<HabitTemplateEntity>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    fixturesService = moduleFixture.get(FixturesService);
    habitTemplatesRepository = moduleFixture.get(
      getRepositoryToken(HabitTemplateEntity),
    );

    await app.init();
    const server = app.getHttpServer();
    request = supertest(server);
  });

  describe('POST /api/system/habit-templates', () => {
    let response: supertest.Response;
    let newHabitTemplate: HabitTemplateEntity;

    let requestBody: SystemCreateHabitTemplateDto;
    let adminUserFixtures: AdminFixtures;
    let systemTemplatesFixtures: SystemTemplatesFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.HABIT_TEMPLATES_CREATE,
      ]);
      systemTemplatesFixtures = await fixturesService.createSystemTemplatesFixtures();

      requestBody = {
        description: faker.random.words(),
        categoryId: systemTemplatesFixtures.category.id,
        defaultReccurence: '2 days',
        points: faker.random.number(),
        translations: {
          name: {
            EN: 'test',
            RU: 'тест',
            UA: 'тест',
          },
        },
      };

      response = await request
        .post(`/api/system/habit-templates`)
        .set('Authorization', `Bearer ${adminUserFixtures.adminToken}`)
        .send(requestBody);

      newHabitTemplate = await habitTemplatesRepository.findOne(
        response.body.id,
      );
    });

    afterAll(async () => {
      await fixturesService.clearAll();
      await habitTemplatesRepository.remove(newHabitTemplate);
    });

    it('should return 201 Created', () => {
      expect(response.status).toEqual(201);
    });

    it('should create new system habit template', () => {
      expect(newHabitTemplate).toMatchObject(requestBody);
      expect(newHabitTemplate.familyId).toBeFalsy();
    });

    it('should return expected result', () => {
      const { category } = systemTemplatesFixtures;

      expect(response.body).toEqual({
        id: newHabitTemplate.id,
        name: null,
        description: requestBody.description,
        points: requestBody.points,
        imageUrl: null,
        defaultReccurence: requestBody.defaultReccurence,
        category: {
          id: category.id,
          name: category.name,
          translations: category.translations,
          imageUrl: null,
          imageHabitScreenUrl: category.imageHabitScreenUrl,
        },
        translations: requestBody.translations,
      });
    });
  });

  describe('GET /api/system/habit-templates', () => {
    let response: supertest.Response;

    let adminUserFixtures: AdminFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.HABIT_TEMPLATES_READ,
      ]);
      await fixturesService.createSystemTemplatesFixtures();

      response = await request
        .get(`/api/system/habit-templates?page=1`)
        .set('Authorization', `Bearer ${adminUserFixtures.adminToken}`)
        .send();
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should return expected result', () => {
      const responseBody = response.body;

      expect(responseBody).toBeTruthy();
      const expectedKeys = [
        'id',
        'name',
        'description',
        'points',
        'imageUrl',
        'defaultReccurence',
        'category',
        'translations',
      ];
      expectedKeys.forEach(key => {
        expect(responseBody.templates[0]).toHaveProperty(key);
      });
      expect(responseBody.pagesCount).toBeGreaterThanOrEqual(1);
      expect(responseBody.recordsCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('PATCH /api/system/habit-templates/:templateId', () => {
    let response: supertest.Response;
    let updatedHabitTemplate: HabitTemplateEntity;

    let requestBody: SystemUpdateHabitTemplateDto;
    let adminUserFixtures: AdminFixtures;
    let systemTemplatesFixtures: SystemTemplatesFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.HABIT_TEMPLATES_UPDATE,
      ]);
      systemTemplatesFixtures = await fixturesService.createSystemTemplatesFixtures();
      const { habitTemplate } = systemTemplatesFixtures;

      requestBody = {
        points: faker.random.number(),
        translations: {
          name: {
            EN: 'test',
            RU: 'тест',
            UA: 'тест',
          },
        },
      };

      response = await request
        .patch(`/api/system/habit-templates/${habitTemplate.id}`)
        .set('Authorization', `Bearer ${adminUserFixtures.adminToken}`)
        .send(requestBody);

      updatedHabitTemplate = await habitTemplatesRepository.findOne(
        habitTemplate.id,
      );
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update system habit template', () => {
      expect(updatedHabitTemplate).toMatchObject(requestBody);
    });

    it('should return expected result', () => {
      const { habitTemplate, category } = systemTemplatesFixtures;

      expect(response.body).toEqual({
        id: habitTemplate.id,
        name: habitTemplate.name,
        description: habitTemplate.description,
        points: requestBody.points,
        imageUrl: habitTemplate.imageUrl,
        defaultReccurence: habitTemplate.defaultReccurence,
        category: {
          id: category.id,
          name: category.name,
          translations: category.translations,
          imageUrl: category.imageUrl,
          imageHabitScreenUrl: category.imageHabitScreenUrl,
        },
        translations: requestBody.translations,
      });
    });
  });

  describe('DELETE /api/system/habit-templates/:templateId', () => {
    let response: supertest.Response;
    let removedHabitTemplate: HabitTemplateEntity;

    let adminUserFixtures: AdminFixtures;
    let systemTemplatesFixtures: SystemTemplatesFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.HABIT_TEMPLATES_DELETE,
      ]);
      systemTemplatesFixtures = await fixturesService.createSystemTemplatesFixtures();
      const { habitTemplate } = systemTemplatesFixtures;

      response = await request
        .delete(`/api/system/habit-templates/${habitTemplate.id}`)
        .set('Authorization', `Bearer ${adminUserFixtures.adminToken}`)
        .send();

      removedHabitTemplate = await habitTemplatesRepository.findOne(
        habitTemplate.id,
      );
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 204 No Content', () => {
      expect(response.status).toEqual(204);
    });

    it('should remove system award template', () => {
      expect(removedHabitTemplate).toBeFalsy();
    });
  });
});
