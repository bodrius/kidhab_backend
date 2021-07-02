import context from 'jest-plugin-context';
import * as faker from 'faker';
import * as _ from 'lodash';
import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenService } from './children.service';
import { FamiliesServiceMock, RepositoryMock } from '@src/shared/mocks';
import { Genders } from './gender.enum';
import { AwardsService } from '@src/modules/awards-management/awards/common/awards.service';
import { HabitCategoriesService } from '@src/modules/habits-management/habit-categories/common/habit-categories.service';
import { ParentsService } from '@src/modules/parents/common/parents.service';
import { HabitsService } from '@src/modules/habits-management/habits/common/habits.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ChildrenRepository } from './children.repository';
import { NotificationsForParentService } from '@src/modules/notifications/notifications-for-parent/common/notifications-for-parent.service';
import { ActiveAwardsService } from '@src/modules/awards-management/awards/common/active-awards.service';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { repositoryMocks } from '@src/shared/mocks/mock-all-repos';
import { PushNotificationsService } from '@src/modules/push-notifications/push-notifications.service';
import { PushNotificationsServiceMock } from '@src/shared/mocks/services/push-notifications.service.mock';
import { FamiliesService } from '@src/modules/families/common/families.service';
import { AwardTemplatesService } from '@src/modules/awards-management/award-templates/common/award-templates.service';
import { AwardTemplatesServiceMock } from '@src/shared/mocks/services/award-templates.service.mock';

class ServiceMock {}

describe('ChildrenService', () => {
  let service: ChildrenService;
  let childrenRepository: RepositoryMock;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ChecksModule],
      providers: [
        ...repositoryMocks,
        { provide: HabitsService, useClass: ServiceMock },
        { provide: HabitCategoriesService, useClass: ServiceMock },
        { provide: FamiliesService, useClass: FamiliesServiceMock },
        { provide: AwardTemplatesService, useClass: AwardTemplatesServiceMock },
        AwardsService,
        ParentsService,
        ChildrenService,
        NotificationsForParentService,
        ActiveAwardsService,
        {
          provide: PushNotificationsService,
          useClass: PushNotificationsServiceMock,
        },
      ],
    }).compile();

    service = module.get<ChildrenService>(ChildrenService);
    childrenRepository = module.get(ChildrenRepository);
  });

  describe('#createChild', () => {
    const parent: any = {
      id: faker.random.uuid(),
      familyId: faker.random.uuid(),
    };
    const createChildDto = {
      gender: Genders.MALE,
      username: faker.name.firstName(),
      age: faker.random.number(20),
      categoryIds: [],
    };
    const childCreated = { id: faker.random.uuid() };

    let actualResult;

    beforeAll(async () => {
      childrenRepository.save.mockResolvedValue(childCreated);

      actualResult = await service.createChild(parent, createChildDto);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should call childrenRepository.save once', () => {
      expect(childrenRepository.save).toBeCalledTimes(1);

      expect(childrenRepository.save).toBeCalledWith(
        expect.objectContaining({
          parent,
          ..._.omit(createChildDto, 'categoryIds'),
          categories: createChildDto.categoryIds.map(id => ({ id })),
          family: { id: parent.familyId },
        }),
      );
    });

    it('should return expected result', () => {
      expect(actualResult).toEqual(childCreated);
    });
  });

  describe('#getChild', () => {
    const criterias: any = { id: faker.random.uuid() };
    const childFound = { id: faker.random.uuid() };

    let actualResult;

    beforeAll(async () => {
      childrenRepository.findOne.mockResolvedValue(childFound);

      actualResult = await service.getChild(criterias);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should call childrenRepository.findOne once', () => {
      expect(childrenRepository.findOne).toBeCalledTimes(1);

      expect(childrenRepository.findOne).toBeCalledWith(criterias);
    });

    it('should return expected result', () => {
      expect(actualResult).toEqual(childFound);
    });
  });

  describe('#getChildrenByFamilyId', () => {
    const familyId = faker.random.uuid();
    const childrenFound = [{ id: faker.random.uuid() }];

    let actualResult;

    beforeAll(async () => {
      childrenRepository.find.mockResolvedValue(childrenFound);

      actualResult = await service.getChildrenByFamilyId(familyId);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should call childrenRepository.find once', () => {
      expect(childrenRepository.find).toBeCalledTimes(1);

      expect(childrenRepository.find).toBeCalledWith({
        where: { family: { id: familyId } },
      });
    });

    it('should return expected result', () => {
      expect(actualResult).toEqual(childrenFound);
    });
  });

  describe('#updateChild', () => {
    const child: any = { id: faker.random.uuid() };
    const paramsToUpdate = { username: faker.name.firstName() };
    const childMerged = { id: faker.random.uuid() };
    const childUpdated = { id: faker.random.uuid() };

    let actualResult;

    beforeAll(async () => {
      childrenRepository.merge.mockReturnValue(childMerged);
      childrenRepository.save.mockResolvedValue(childUpdated);

      actualResult = await service.updateChild(child, paramsToUpdate);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should call childrenRepository.merge once', () => {
      expect(childrenRepository.merge).toBeCalledTimes(1);

      expect(childrenRepository.merge).toBeCalledWith(child, paramsToUpdate);
    });

    it('should call childrenRepository.save once', () => {
      expect(childrenRepository.save).toBeCalledTimes(1);

      expect(childrenRepository.save).toBeCalledWith(childMerged);
    });

    it('should return expected result', () => {
      expect(actualResult).toEqual(childUpdated);
    });
  });

  describe('#upsertInviteHash', () => {
    context('when child not found', () => {
      const childId = faker.random.uuid();
      const parent: any = { id: faker.random.uuid() };

      let actualResult;

      beforeAll(async () => {
        try {
          await service.upsertInviteHash(childId, parent);
        } catch (err) {
          actualResult = err;
        }
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('should call childrenRepository.findOne once', () => {
        expect(childrenRepository.findOne).toBeCalledTimes(1);
        expect(childrenRepository.findOne).toBeCalledWith(childId);
      });

      it('should not call childrenRepository.merge', () => {
        expect(childrenRepository.merge).not.toBeCalled();
      });

      it('should not call childrenRepository.save', () => {
        expect(childrenRepository.save).not.toBeCalled();
      });

      it('should throw NotFoundException', () => {
        expect(actualResult).toBeInstanceOf(NotFoundException);
      });
    });

    context('when child is not member of parent family', () => {
      const childId = faker.random.uuid();
      const parent: any = {
        id: faker.random.uuid(),
        familyId: faker.random.uuid(),
      };
      const childFound = {
        id: faker.random.uuid(),
        familyId: faker.random.uuid(),
      };

      let actualResult;

      beforeAll(async () => {
        childrenRepository.findOne.mockResolvedValue(childFound);

        try {
          await service.upsertInviteHash(childId, parent);
        } catch (err) {
          actualResult = err;
        }
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('should call childrenRepository.findOne once', () => {
        expect(childrenRepository.findOne).toBeCalledTimes(1);
        expect(childrenRepository.findOne).toBeCalledWith(childId);
      });

      it('should not call childrenRepository.merge', () => {
        expect(childrenRepository.merge).not.toBeCalled();
      });

      it('should not call childrenRepository.save', () => {
        expect(childrenRepository.save).not.toBeCalled();
      });

      it('should throw ForbiddenException', () => {
        expect(actualResult).toBeInstanceOf(ForbiddenException);
      });
    });

    context('when child already has inviteHash', () => {
      const childId = faker.random.uuid();
      const familyId = faker.random.uuid();
      const parent: any = { id: faker.random.uuid(), familyId };
      const childFound = {
        id: faker.random.uuid(),
        familyId,
        inviteHash: faker.random.word(),
      };

      let actualResult;

      beforeAll(async () => {
        childrenRepository.findOne.mockResolvedValue(childFound);

        actualResult = await service.upsertInviteHash(childId, parent);
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('should call childrenRepository.findOne once', () => {
        expect(childrenRepository.findOne).toBeCalledTimes(1);
        expect(childrenRepository.findOne).toBeCalledWith(childId);
      });

      it('should not call childrenRepository.merge ', () => {
        expect(childrenRepository.merge).not.toBeCalled();
      });

      it('should not call childrenRepository.save', () => {
        expect(childrenRepository.save).not.toBeCalled();
      });

      it('should return expected result', () => {
        expect(actualResult).toEqual(childFound);
      });
    });

    context('when child does not have inviteHash', () => {
      const childId = faker.random.uuid();
      const familyId = faker.random.uuid();
      const parent: any = { id: faker.random.uuid(), familyId };
      const childFound = { id: faker.random.uuid(), familyId };
      const childMerged = { id: faker.random.uuid() };
      const childSaved = { id: faker.random.uuid() };

      let actualResult;

      beforeAll(async () => {
        childrenRepository.findOne.mockResolvedValue(childFound);
        childrenRepository.merge.mockReturnValue(childMerged);
        childrenRepository.save.mockResolvedValue(childSaved);

        actualResult = await service.upsertInviteHash(childId, parent);
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('should call childrenRepository.findOne once', () => {
        expect(childrenRepository.findOne).toBeCalledTimes(1);
        expect(childrenRepository.findOne).toBeCalledWith(childId);
      });

      it('should call childrenRepository.merge once', () => {
        expect(childrenRepository.merge).toBeCalledTimes(1);
        expect(childrenRepository.merge).toBeCalledWith(childFound, {
          inviteHash: expect.stringMatching(/./),
        });
      });

      it('should call childrenRepository.save once', () => {
        expect(childrenRepository.save).toBeCalledTimes(1);
        expect(childrenRepository.save).toBeCalledWith(childMerged);
      });

      it('should return expected result', () => {
        expect(actualResult).toEqual(childSaved);
      });
    });
  });
});
