import * as faker from 'faker';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from '@src/app.module';
import { configureApp } from '@src/configure-app';
import {
  FixturesService,
  AdminFixtures,
} from '@src/shared/fixtures/fixtures.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from '@src/modules/sessions/session.entity';
import { AdminUserSignInDto } from './dto/admin-user-sign-in.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AdminUserEntity } from '@src/modules/admin-users/common/admin-user.entity';
import { AuthBaseService } from '@src/modules/auth-management/auth-base/auth-base.service';

describe('Admin Users Auth Controller (e2e)', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let app: INestApplication;
  let fixturesService: FixturesService;
  let authBaseService: AuthBaseService;
  let sessionsRepository: Repository<SessionEntity>;
  let adminUsersRepository: Repository<AdminUserEntity>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    fixturesService = moduleFixture.get(FixturesService);
    authBaseService = moduleFixture.get(AuthBaseService);

    sessionsRepository = moduleFixture.get(getRepositoryToken(SessionEntity));
    adminUsersRepository = moduleFixture.get(
      getRepositoryToken(AdminUserEntity),
    );

    await app.init();
    const server = app.getHttpServer();
    request = supertest(server);
  });

  describe('POST /api/admin-users-auth/sign-in', () => {
    let response: supertest.Response;

    let requestBody: AdminUserSignInDto;
    let adminUserFixtures: AdminFixtures;

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures();

      requestBody = {
        email: adminUserFixtures.admin.email,
        password: adminUserFixtures.adminPassword,
      };

      response = await request
        .post(`/api/admin-users-auth/sign-in`)
        .send(requestBody);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
      await sessionsRepository.delete({
        adminUser: adminUserFixtures.admin,
      });
    });

    it('should return 201 Created', () => {
      expect(response.status).toEqual(201);
    });

    it('should create new session', async () => {
      const newSession = await sessionsRepository.findOne({
        adminUser: adminUserFixtures.admin,
      });
      expect(newSession).toBeTruthy();
    });

    it('should return expected result', () => {
      const { admin, adminRole } = adminUserFixtures;

      const expectedResult = {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: {
          id: adminRole.id,
          name: adminRole.name,
          permissions: adminRole.permissions,
        },
        shouldResetPassword: admin.shouldResetPassword,
      };

      expect(response.body).toBeTruthy();
      expect(response.body.user).toEqual(expectedResult);
      expect(response.body.token).toBeTruthy();
    });
  });
  describe('PATCH /api/admin-users-auth/reset-password', () => {
    let response: supertest.Response;

    let requestBody: ResetPasswordDto;
    let adminUserFixtures: AdminFixtures;

    const newPassword = faker.random.words();

    beforeAll(async () => {
      adminUserFixtures = await fixturesService.createAdminFixtures(
        [],
        true,
      );

      requestBody = {
        email: adminUserFixtures.admin.email,
        oldPassword: adminUserFixtures.adminPassword,
        newPassword: newPassword,
      };

      response = await request
        .patch(`/api/admin-users-auth/reset-password`)
        .send(requestBody);
    });

    afterAll(async () => {
      await fixturesService.clearAll();
    });

    it('should return 204 No Content', () => {
      expect(response.status).toEqual(204);
    });

    it('should reset password', async () => {
      const updatedAdminUser = await adminUsersRepository.findOne({
        id: adminUserFixtures.admin.id,
      });
      const isPasswordUpdated = authBaseService.comparePasswords(
        newPassword,
        updatedAdminUser.passwordHash,
      );

      expect(isPasswordUpdated).toBeTruthy();
    });
  });
});
