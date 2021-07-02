import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from '@src/app.module';
import { configureApp } from '@src/configure-app';
import {
  FixturesService,
  AdminFixtures,
  FamilyFixtures,
} from '@src/shared/fixtures/fixtures.service';
import { AdminPermissions } from '@src/modules/admin-users/common/permissions.enum';
import { ParentsRepository } from '../common/parents.repository';
import { ParentEntity } from '../common/parent.entity';
import { SystemUpdateParentDto } from './dto/system-update-parent.dto';

describe('Parents (Administration) Controller (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let fixturesService: FixturesService;
  let parentsRepository: ParentsRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    fixturesService = moduleFixture.get(FixturesService);
    parentsRepository = moduleFixture.get(ParentsRepository);

    await app.init();
    const server = app.getHttpServer();
    request = supertest(server);
  });

  describe('GET /api/system/parents', () => {
    let response: supertest.Response;

    let adminUserFixtures: AdminFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.PARENTS_ALL,
      ]);
      await fixturesService.createFamilyFixtures();

      response = await request
        .get(`/api/system/parents?page=1`)
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
        'email',
        'isTestPassed',
        'username',
        'avatarPath',
        'country',
        'familyId',
        'createdAt',
      ];
      expectedKeys.forEach(key => {
        expect(responseBody.parents[0]).toHaveProperty(key);
      });
      expect(responseBody.pagesCount).toBeGreaterThanOrEqual(1);
      expect(responseBody.recordsCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/system/parents/search', () => {
    let response: supertest.Response;

    let adminUserFixtures: AdminFixtures;
    let familyFixtures: FamilyFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.PARENTS_READ,
      ]);
      familyFixtures = await fixturesService.createFamilyFixtures();

      response = await request
        .get(
          `/api/system/parents/search?page=1&query=${familyFixtures.parent.email}`,
        )
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
      const { parent } = familyFixtures;

      expect(response.body).toEqual({
        parents: [
          {
            id: parent.id,
            activatedChildrenCount: 0,
            email: parent.email,
            isTestPassed: parent.isTestPassed,
            username: parent.username,
            language: parent.language,
            avatarPath: parent.avatarPath,
            country: parent.country,
            familyId: parent.familyId,
            createdAt: parent.createdAt.toISOString(),
          },
        ],
        pagesCount: 1,
        recordsCount: 1,
      });
    });
  });

  describe('GET /api/system/parents/:parentId', () => {
    let response: supertest.Response;

    let adminUserFixtures: AdminFixtures;
    let familyFixtures: FamilyFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.PARENTS_READ,
      ]);
      familyFixtures = await fixturesService.createFamilyFixtures();
      const { parent } = familyFixtures;

      response = await request
        .get(`/api/system/parents/${parent.id}`)
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
      const { parent } = familyFixtures;

      expect(response.body).toEqual({
        id: parent.id,
        activatedChildrenCount: 0,
        email: parent.email,
        isTestPassed: parent.isTestPassed,
        username: parent.username,
        language: parent.language,
        avatarPath: parent.avatarPath,
        country: parent.country,
        familyId: parent.familyId,
        createdAt: parent.createdAt.toISOString(),
      });
    });
  });

  describe('PUT /api/system/parents/:parentId', () => {
    let response: supertest.Response;
    let updatedParent: ParentEntity;

    let requestBody: SystemUpdateParentDto;
    let adminUserFixtures: AdminFixtures;
    let familyFixtures: FamilyFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.PARENTS_UPDATE,
      ]);
      familyFixtures = await fixturesService.createFamilyFixtures();
      const { parent } = familyFixtures;

      requestBody = {
        isTestPassed: false,
      };

      response = await request
        .put(`/api/system/parents/${parent.id}`)
        .set('Authorization', `Bearer ${adminUserFixtures.adminToken}`)
        .send(requestBody);

      updatedParent = await parentsRepository.findOne(parent.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 200 OK', () => {
      expect(response.status).toEqual(200);
    });

    it('should update parent', () => {
      expect(updatedParent).toMatchObject(requestBody);
    });

    it('should return expected result', () => {
      const { parent } = familyFixtures;

      expect(response.body).toEqual({
        id: parent.id,
        activatedChildrenCount: 0,
        email: parent.email,
        isTestPassed: requestBody.isTestPassed,
        username: parent.username,
        language: parent.language,
        avatarPath: parent.avatarPath,
        country: parent.country,
        familyId: parent.familyId,
        createdAt: parent.createdAt.toISOString(),
      });
    });
  });

  describe('DELETE /api/system/parents/:parentId', () => {
    let response: supertest.Response;
    let removedParent: ParentEntity;

    let adminUserFixtures: AdminFixtures;
    let familyFixtures: FamilyFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.PARENTS_DELETE,
      ]);
      familyFixtures = await fixturesService.createFamilyFixtures();
      const { parent } = familyFixtures;

      response = await request
        .delete(`/api/system/parents/${parent.id}`)
        .set('Authorization', `Bearer ${adminUserFixtures.adminToken}`)
        .send();

      removedParent = await parentsRepository.findOne(parent.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 204 No Content', () => {
      expect(response.status).toEqual(204);
    });

    it('should remove parent', () => {
      expect(removedParent).toBeFalsy();
    });
  });
});
