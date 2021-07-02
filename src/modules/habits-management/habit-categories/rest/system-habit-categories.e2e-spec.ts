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
import { AdminPermissions } from '@src/modules/admin-users/common/permissions.enum';
import { HabitCategoriesRepository } from '../common/habit-categories.repository';
import { HabitCategoryEntity } from '../common/habit-category.entity';
import { HabitCategoryStatuses } from '../common/habit-category-statuses.enum';
import { SystemCreateHabitCategoryDto } from '../common/dto/system-create-habit-category.dto';

describe('Habit Categories (Administration) Controller (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let fixturesService: FixturesService;
  let habitCategoriesRepository: HabitCategoriesRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    fixturesService = moduleFixture.get(FixturesService);
    habitCategoriesRepository = moduleFixture.get(HabitCategoriesRepository);

    await app.init();
    const server = app.getHttpServer();
    request = supertest(server);
  });

  describe('POST /api/system/habit-categories', () => {
    let response: supertest.Response;
    let newHabitCategory: HabitCategoryEntity;

    let requestBody: SystemCreateHabitCategoryDto;
    let adminUserFixtures: AdminFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.HABIT_CATEGORIES_CREATE,
      ]);

      requestBody = {
        translations: {
          name: {
            EN: 'test',
            RU: 'тест',
            UA: 'тєст',
          },
        },
      };

      response = await request
        .post(`/api/system/habit-categories`)
        .set('Authorization', `Bearer ${adminUserFixtures.adminToken}`)
        .send(requestBody);

      newHabitCategory = await habitCategoriesRepository.findOne(
        response.body.id,
      );
    });

    afterAll(async () => {
      await fixturesService.clearAll();
      await habitCategoriesRepository.remove(newHabitCategory);
    });

    it('should return 201 Created', () => {
      expect(response.status).toEqual(201);
    });

    it('should create new habit category', () => {
      expect(newHabitCategory).toMatchObject(requestBody);
    });

    it('should return expected result', () => {
      expect(response.body).toEqual({
        id: newHabitCategory.id,
        name: null,
        translations: requestBody.translations,
        imageUrl: null,
        imageHabitScreenUrl: newHabitCategory.imageHabitScreenUrl,
      });
    });
  });

  describe('GET /api/system/habit-categories', () => {
    let response: supertest.Response;

    let adminUserFixtures: AdminFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.HABIT_CATEGORIES_READ,
      ]);
      await fixturesService.createSystemTemplatesFixtures();

      response = await request
        .get(`/api/system/habit-categories?page=1`)
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
      expect(responseBody.categories instanceof Array).toBeTruthy();

      const firstCategory = responseBody.categories[0];
      expect(firstCategory).toHaveProperty('id');
      expect(firstCategory).toHaveProperty('name');
      expect(firstCategory).toHaveProperty('translations');
      expect(responseBody.pagesCount).toBeGreaterThanOrEqual(1);
      expect(responseBody.recordsCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('PATCH /api/system/habit-categories/:categoryId', () => {
    let response: supertest.Response;
    let updatedHabitCategory: HabitCategoryEntity;

    let requestBody: SystemCreateHabitCategoryDto;
    let adminUserFixtures: AdminFixtures;
    let systemTemplatesFixtures: SystemTemplatesFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.HABIT_CATEGORIES_UPDATE,
      ]);
      systemTemplatesFixtures = await fixturesService.createSystemTemplatesFixtures();
      const { category } = systemTemplatesFixtures;

      requestBody = {
        translations: {
          name: {
            EN: 'test',
            RU: 'тест',
            UA: 'тєст',
          },
        },
      };

      response = await request
        .patch(`/api/system/habit-categories/${category.id}`)
        .set('Authorization', `Bearer ${adminUserFixtures.adminToken}`)
        .send(requestBody);

      updatedHabitCategory = await habitCategoriesRepository.findOne(
        category.id,
      );
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update habit category', () => {
      expect(updatedHabitCategory).toMatchObject(requestBody);
    });

    it('should return expected result', () => {
      const { category } = systemTemplatesFixtures;

      expect(response.body).toEqual({
        id: category.id,
        name: category.name,
        translations: requestBody.translations,
        imageUrl: category.imageUrl,
        imageHabitScreenUrl: category.imageHabitScreenUrl,
      });
    });
  });

  describe('DELETE /api/system/award-templates/:templateId', () => {
    let response: supertest.Response;
    let removedHabitCategory: HabitCategoryEntity;

    let adminUserFixtures: AdminFixtures;
    let systemTemplatesFixtures: SystemTemplatesFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.HABIT_CATEGORIES_DELETE,
      ]);
      systemTemplatesFixtures = await fixturesService.createSystemTemplatesFixtures();
      const { category } = systemTemplatesFixtures;

      response = await request
        .delete(`/api/system/habit-categories/${category.id}`)
        .set('Authorization', `Bearer ${adminUserFixtures.adminToken}`)
        .send();

      removedHabitCategory = await habitCategoriesRepository.findOne(
        category.id,
      );
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 204 No Content', () => {
      expect(response.status).toEqual(204);
    });

    it('should mark habit category as removed', () => {
      expect(removedHabitCategory).toMatchObject({
        status: HabitCategoryStatuses.DELETED,
      });
    });
  });
});
