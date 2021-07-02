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
import { ChildEntity } from '../common/child.entity';
import { ChildrenRepository } from '../common/children.repository';

describe('Children (Administration) Controller (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let fixturesService: FixturesService;
  let childrenRepository: ChildrenRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    fixturesService = moduleFixture.get(FixturesService);
    childrenRepository = moduleFixture.get(ChildrenRepository);

    await app.init();
    const server = app.getHttpServer();
    request = supertest(server);
  });

  describe('GET /api/system/children', () => {
    let response: supertest.Response;

    let adminUserFixtures: AdminFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.CHILDREN_ALL,
      ]);
      await fixturesService.createFamilyFixtures();

      response = await request
        .get(`/api/system/children?page=1`)
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
        'username',
        'age',
        'email',
        'avatarPath',
        'balance',
        'gender',
        'status',
      ];
      expectedKeys.forEach(key => {
        expect(responseBody.children[0]).toHaveProperty(key);
      });
      expect(responseBody.pagesCount).toBeGreaterThanOrEqual(1);
      expect(responseBody.recordsCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/system/children/search', () => {
    let response: supertest.Response;

    let adminUserFixtures: AdminFixtures;
    let familyFixtures: FamilyFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.CHILDREN_READ,
      ]);
      familyFixtures = await fixturesService.createFamilyFixtures();

      response = await request
        .get(
          `/api/system/children/search?page=1&query=${familyFixtures.child.email}`,
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
      const { child } = familyFixtures;

      expect(response.body).toEqual({
        children: [
          {
            id: child.id,
            username: child.username,
            age: child.age,
            email: child.email,
            language: child.language,
            avatarPath: child.avatarPath,
            familyId: child.familyId,
            balance: child.balance,
            gender: child.gender,
            status: child.status,
          },
        ],
        pagesCount: 1,
        recordsCount: 1,
      });
    });
  });

  describe('GET /api/system/children/:childId', () => {
    let response: supertest.Response;

    let adminUserFixtures: AdminFixtures;
    let familyFixtures: FamilyFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.CHILDREN_READ,
      ]);
      familyFixtures = await fixturesService.createFamilyFixtures();
      const { child } = familyFixtures;

      response = await request
        .get(`/api/system/children/${child.id}`)
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
      const { child } = familyFixtures;

      expect(response.body).toEqual({
        id: child.id,
        familyId: child.familyId,
        username: child.username,
        age: child.age,
        email: child.email,
        language: child.language,
        avatarPath: child.avatarPath,
        balance: child.balance,
        gender: child.gender,
        status: child.status,
      });
    });
  });

  describe('DELETE /api/system/children/:childId', () => {
    let response: supertest.Response;
    let removedChild: ChildEntity;

    let adminUserFixtures: AdminFixtures;
    let familyFixtures: FamilyFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures([
        AdminPermissions.CHILDREN_DELETE,
      ]);
      familyFixtures = await fixturesService.createFamilyFixtures();
      const { child } = familyFixtures;

      response = await request
        .delete(`/api/system/children/${child.id}`)
        .set('Authorization', `Bearer ${adminUserFixtures.adminToken}`)
        .send();

      removedChild = await childrenRepository.findOne(child.id);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 204 No Content', () => {
      expect(response.status).toEqual(204);
    });

    it('should remove child', () => {
      expect(removedChild).toBeFalsy();
    });
  });
});
