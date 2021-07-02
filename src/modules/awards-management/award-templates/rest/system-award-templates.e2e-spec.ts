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
import { AwardTypes } from '../../award-types.enum';
import { AwardTemplateEntity } from '../common/award-template.entity';
import { AdminPermissions } from '@src/modules/admin-users/common/permissions.enum';
import { SystemCreateAwardTemplateDto } from '../common/dto/system-create-award-template.dto';
import { SystemUpdateAwardTemplateDto } from '../common/dto/system-update-award-template.dto';

describe('Award Templates (Administration) Controller (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let fixturesService: FixturesService;
  let awardTemplatesRepository: Repository<AwardTemplateEntity>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    fixturesService = moduleFixture.get(FixturesService);
    awardTemplatesRepository = moduleFixture.get(
      getRepositoryToken(AwardTemplateEntity),
    );

    await app.init();
    const server = app.getHttpServer();
    request = supertest(server);
  });

  describe('POST /api/system/award-templates', () => {
    let response: supertest.Response;
    let newAwardTemplate: AwardTemplateEntity;

    let requestBody: SystemCreateAwardTemplateDto;
    let adminUserFixtures: AdminFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.AWARD_TEMPLATES_CREATE,
      ]);

      requestBody = {
        description: faker.random.words(),
        type: AwardTypes.MATERIAL,
        cost: faker.random.number(),
        imageUrl: faker.internet.url(),
        translations: {
          name: {
            EN: 'test',
            RU: 'тест',
            UA: 'тест',
          },
        },
      };

      response = await request
        .post(`/api/system/award-templates`)
        .set('Authorization', `Bearer ${adminUserFixtures.adminToken}`)
        .send(requestBody);

      newAwardTemplate = await awardTemplatesRepository.findOne(
        response.body.id,
      );
    });

    afterAll(async () => {
      await fixturesService.clearAll();
      await awardTemplatesRepository.remove(newAwardTemplate);
    });

    it('should return 201 Created', () => {
      expect(response.status).toEqual(201);
    });

    it('should create new system award template', () => {
      expect(newAwardTemplate).toMatchObject(requestBody);
      expect(newAwardTemplate.familyId).toBeFalsy();
    });

    it('should return expected result', () => {
      expect(response.body).toEqual({
        id: newAwardTemplate.id,
        name: null,
        description: requestBody.description,
        cost: requestBody.cost,
        imageUrl: requestBody.imageUrl,
        type: requestBody.type,
        translations: requestBody.translations,
      });
    });
  });

  describe('GET /api/system/award-templates', () => {
    let response: supertest.Response;

    let adminUserFixtures: AdminFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.AWARD_TEMPLATES_READ,
      ]);
      await fixturesService.createSystemTemplatesFixtures();

      response = await request
        .get(`/api/system/award-templates?page=1`)
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
        'cost',
        'imageUrl',
        'type',
        'translations',
      ];
      Object.keys(responseBody.templates[0]).forEach(key => {
        expect(expectedKeys).toContain(key);
      });
      expect(responseBody.pagesCount).toBeGreaterThanOrEqual(1);
      expect(responseBody.recordsCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('PATCH /api/system/award-templates/:templateId', () => {
    let response: supertest.Response;
    let updatedAwardTemplate: AwardTemplateEntity;

    let requestBody: SystemUpdateAwardTemplateDto;
    let adminUserFixtures: AdminFixtures;
    let systemTemplatesFixtures: SystemTemplatesFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.AWARD_TEMPLATES_UPDATE,
      ]);
      systemTemplatesFixtures = await fixturesService.createSystemTemplatesFixtures();
      const { awardTemplate } = systemTemplatesFixtures;

      requestBody = {
        cost: faker.random.number(),
        translations: {
          name: {
            EN: 'test',
            RU: 'тест',
            UA: 'тест',
          },
        },
      };

      response = await request
        .patch(`/api/system/award-templates/${awardTemplate.id}`)
        .set('Authorization', `Bearer ${adminUserFixtures.adminToken}`)
        .send(requestBody);

      updatedAwardTemplate = await awardTemplatesRepository.findOne(
        awardTemplate.id,
      );
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update system award template', () => {
      expect(updatedAwardTemplate).toMatchObject(requestBody);
    });

    it('should return expected result', () => {
      const { awardTemplate } = systemTemplatesFixtures;

      expect(response.body).toEqual({
        id: awardTemplate.id,
        name: awardTemplate.name,
        description: awardTemplate.description,
        cost: requestBody.cost,
        imageUrl: awardTemplate.imageUrl,
        type: awardTemplate.type,
        translations: requestBody.translations,
      });
    });
  });

  describe('DELETE /api/system/award-templates/:templateId', () => {
    let response: supertest.Response;
    let removedAwardTemplate: AwardTemplateEntity;

    let adminUserFixtures: AdminFixtures;
    let systemTemplatesFixtures: SystemTemplatesFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.AWARD_TEMPLATES_DELETE,
      ]);
      systemTemplatesFixtures = await fixturesService.createSystemTemplatesFixtures();
      const { awardTemplate } = systemTemplatesFixtures;

      response = await request
        .delete(`/api/system/award-templates/${awardTemplate.id}`)
        .set('Authorization', `Bearer ${adminUserFixtures.adminToken}`)
        .send();

      removedAwardTemplate = await awardTemplatesRepository.findOne(
        awardTemplate.id,
      );
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 204 No Content', () => {
      expect(response.status).toEqual(204);
    });

    it('should remove system award template', () => {
      expect(removedAwardTemplate).toBeFalsy();
    });
  });
});
