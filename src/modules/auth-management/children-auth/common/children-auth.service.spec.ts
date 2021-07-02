import context from 'jest-plugin-context';
import * as faker from 'faker';
import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenAuthService } from './children-auth.service';
import {
  RepositoryMock,
  AuthBaseServiceMock,
  SessionsRepositoryMock,
} from '@src/shared/mocks';
import { AuthBaseService } from '@src/modules/auth-management/auth-base/auth-base.service';
import { ChildrenService } from '@src/modules/children/common/children.service';
import { SessionsService } from '@src/modules/sessions/sessions.service';
import { SessionsRepository } from '@src/modules/sessions/sessions.repository';
import { NotFoundException } from '@nestjs/common';
import { ChildStatuses } from '@src/modules/children/common/child-statuses.enum';
import { HabitsService } from '@src/modules/habits-management/habits/common/habits.service';
import { AwardsService } from '@src/modules/awards-management/awards/common/awards.service';
import { HabitCategoriesService } from '@src/modules/habits-management/habit-categories/common/habit-categories.service';
import { ParentsService } from '@src/modules/parents/common/parents.service';
import { ChildrenRepository } from '@src/modules/children/common/children.repository';
import { ActiveAwardsService } from '@src/modules/awards-management/awards/common/active-awards.service';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { repositoryMocks } from '@src/shared/mocks/mock-all-repos';
import { PushNotificationsServiceMock } from '@src/shared/mocks/services/push-notifications.service.mock';
import { PushNotificationsService } from '@src/modules/push-notifications/push-notifications.service';

class ServiceMock {}

describe('ChildrenAuthService', () => {
  let service: ChildrenAuthService;
  let childrenRepository: RepositoryMock;
  let sessionsRepository: SessionsRepositoryMock;
  let authService: AuthBaseServiceMock;
  let pushNotificationsService: PushNotificationsServiceMock;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ChecksModule],
      providers: [
        ...repositoryMocks,
        { provide: AuthBaseService, useClass: AuthBaseServiceMock },
        { provide: HabitsService, useClass: ServiceMock },
        { provide: AwardsService, useClass: ServiceMock },
        { provide: HabitCategoriesService, useClass: ServiceMock },
        { provide: ParentsService, useClass: ServiceMock },
        ChildrenService,
        SessionsService,
        ChildrenAuthService,
        ActiveAwardsService,
        {
          provide: PushNotificationsService,
          useClass: PushNotificationsServiceMock,
        },
      ],
    }).compile();

    service = module.get<ChildrenAuthService>(ChildrenAuthService);
    childrenRepository = module.get(ChildrenRepository);
    sessionsRepository = module.get(SessionsRepository);
    authService = module.get(AuthBaseService);
    pushNotificationsService = module.get(PushNotificationsService);
  });

  describe('#activateChild', () => {
    context('when child not found', () => {
      const inviteHash = faker.random.word();

      let actualResult;

      beforeAll(async () => {
        try {
          await service.activateChild(inviteHash);
        } catch (err) {
          actualResult = err;
        }
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('should call childrenRepository.findOne once', () => {
        expect(childrenRepository.findOne).toBeCalledTimes(1);
        expect(childrenRepository.findOne).toBeCalledWith({
          inviteHash,
        });
      });

      it('should not call childrenRepository.merge', () => {
        expect(childrenRepository.merge).not.toBeCalled();
      });

      it('should not call childrenRepository.save', () => {
        expect(childrenRepository.save).not.toBeCalled();
      });

      it('should not call pushNotificationsService.sendChildActivated', () => {
        expect(pushNotificationsService.sendChildActivated).not.toBeCalled();
      });

      it('should not call sessionsRepository.save', () => {
        expect(sessionsRepository.save).not.toBeCalled();
      });

      it('should not call authService.createToken', () => {
        expect(authService.createToken).not.toBeCalled();
      });

      it('should throw NotFoundException', () => {
        expect(actualResult).toBeInstanceOf(NotFoundException);
      });
    });

    context('when child found', () => {
      const inviteHash = faker.random.word();

      const childFound = { id: faker.random.uuid() };
      const childMerged = { id: faker.random.uuid() };
      const childSaved = { id: faker.random.uuid() };
      const childSessionCreated = { id: faker.random.uuid() };
      const childTokenCreated = faker.random.uuid();

      let actualResult;

      beforeAll(async () => {
        childrenRepository.findOne.mockResolvedValue(childFound);
        childrenRepository.merge.mockReturnValue(childMerged);
        childrenRepository.save.mockResolvedValue(childSaved);
        sessionsRepository.save.mockResolvedValue(childSessionCreated);
        authService.createToken.mockReturnValue(childTokenCreated);

        actualResult = await service.activateChild(inviteHash);
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('should call childrenRepository.findOne once', () => {
        expect(childrenRepository.findOne).toBeCalledTimes(1);
        expect(childrenRepository.findOne).toBeCalledWith({
          inviteHash,
        });
      });

      it('should call childrenRepository.merge once', () => {
        expect(childrenRepository.merge).toBeCalledTimes(1);
        expect(childrenRepository.merge).toBeCalledWith(childFound, {
          inviteHash: null,
          status: ChildStatuses.ACTIVATED,
        });
      });

      it('should call childrenRepository.save once', () => {
        expect(childrenRepository.save).toBeCalledTimes(1);
        expect(childrenRepository.save).toBeCalledWith(childMerged);
      });

      it('should call pushNotificationsService.sendChildActivated once', () => {
        expect(pushNotificationsService.sendChildActivated).toBeCalledTimes(1);
        expect(pushNotificationsService.sendChildActivated).toBeCalledWith(
          childSaved,
        );
      });

      it('should call sessionsRepository.save once', () => {
        expect(sessionsRepository.save).toBeCalledTimes(1);
        expect(sessionsRepository.save).toBeCalledWith({ child: childSaved });
      });

      it('should call authService.createToken once', () => {
        expect(authService.createToken).toBeCalledTimes(1);
        expect(authService.createToken).toBeCalledWith(childSessionCreated);
      });

      it('should return expected result', () => {
        expect(actualResult).toEqual({
          child: childSaved,
          token: childTokenCreated,
        });
      });
    });
  });
});
