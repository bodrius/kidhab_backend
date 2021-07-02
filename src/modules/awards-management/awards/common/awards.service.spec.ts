import context from 'jest-plugin-context';
import * as faker from 'faker';
import { Test, TestingModule } from '@nestjs/testing';
import { AwardsService } from './awards.service';
import { ChildrenService } from '@src/modules/children/common/children.service';
import { ChildrenServiceMock } from '@src/shared/mocks/services/children.service.mock';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { NotificationsForParentService } from '@src/modules/notifications/notifications-for-parent/common/notifications-for-parent.service';
import { ParentsService } from '@src/modules/parents/common/parents.service';
import { ActiveAwardsService } from './active-awards.service';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { repositoryMocks } from '@src/shared/mocks/mock-all-repos';
import { FamiliesServiceMock, RepositoryMock } from '@src/shared/mocks';
import { PushNotificationsService } from '@src/modules/push-notifications/push-notifications.service';
import { PushNotificationsServiceMock } from '@src/shared/mocks/services/push-notifications.service.mock';
import { FamiliesService } from '@src/modules/families/common/families.service';
import { AwardsRepository } from './awards.repository';
import { AwardTemplatesServiceMock } from '@src/shared/mocks/services/award-templates.service.mock';
import { AwardTemplatesService } from '../../award-templates/common/award-templates.service';

describe('AwardsService', () => {
  let service: AwardsService;
  let awardsRepository: RepositoryMock;
  let childrenService: ChildrenServiceMock;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ChecksModule],
      providers: [
        ...repositoryMocks,
        { provide: ChildrenService, useClass: ChildrenServiceMock },
        { provide: FamiliesService, useClass: FamiliesServiceMock },
        { provide: AwardTemplatesService, useClass: AwardTemplatesServiceMock },
        AwardsService,
        NotificationsForParentService,
        ParentsService,
        ActiveAwardsService,
        {
          provide: PushNotificationsService,
          useClass: PushNotificationsServiceMock,
        },
      ],
    }).compile();

    service = module.get<AwardsService>(AwardsService);
    awardsRepository = module.get(AwardsRepository);
    childrenService = module.get(ChildrenService);
  });

  describe('#createAwards', () => {
    const awards: any = [
      { id: faker.random.uuid() },
      { id: faker.random.uuid() },
    ];
    const child: any = { id: faker.random.uuid() };
    const awardsSaved = [
      { id: faker.random.uuid() },
      { id: faker.random.uuid() },
    ];

    let actualResult;

    beforeAll(async () => {
      awardsRepository.save.mockResolvedValue(awardsSaved);

      actualResult = await service.createAwards(awards, child);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call awardsRepository.save once', () => {
      expect(awardsRepository.save).toBeCalledTimes(1);
      expect(awardsRepository.save).toBeCalledWith(
        awards.map(award => ({ ...award, child })),
      );
    });

    it('should return expected result', () => {
      expect(actualResult).toEqual(awardsSaved);
    });
  });

  describe('#createAwardsGql', () => {
    context('when no childId and no child in context provided', () => {
      const createAwardsDto: any = {
        childId: null,
        awards: [{ id: faker.random.uuid() }, { id: faker.random.uuid() }],
      };
      const parent: any = { id: faker.random.uuid() };
      const ctxChild: any = null;

      let actualResult;

      beforeAll(async () => {
        try {
          await service.createAwardsGql(createAwardsDto, parent, ctxChild);
        } catch (err) {
          actualResult = err;
        }
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should not call childrenService.getChild', () => {
        expect(childrenService.getChild).not.toBeCalled();
      });

      it('should not call awardsRepository.save', () => {
        expect(awardsRepository.save).not.toBeCalled();
      });

      it('should throw BadRequestException', () => {
        expect(actualResult).toBeInstanceOf(BadRequestException);
      });
    });

    context(
      'when childId passed but child is not part of parent family',
      () => {
        const createAwardsDto: any = {
          childId: faker.random.uuid(),
          awards: [{ id: faker.random.uuid() }, { id: faker.random.uuid() }],
        };
        const parent: any = {
          id: faker.random.uuid(),
          familyId: faker.random.uuid(),
        };
        const ctxChild: any = null;
        const childFound = {
          id: faker.random.uuid(),
          familyId: faker.random.uuid(),
        };

        let actualResult;

        beforeAll(async () => {
          childrenService.getChild.mockResolvedValue(childFound);

          try {
            await service.createAwardsGql(createAwardsDto, parent, ctxChild);
          } catch (err) {
            actualResult = err;
          }
        });

        afterAll(() => {
          jest.clearAllMocks();
        });

        it('should call childrenService.getChild once', () => {
          expect(childrenService.getChild).toBeCalledTimes(1);
          expect(childrenService.getChild).toBeCalledWith({
            id: createAwardsDto.childId,
          });
        });

        it('should not call awardsRepository.save', () => {
          expect(awardsRepository.save).not.toBeCalled();
        });

        it('should throw ForbiddenException', () => {
          expect(actualResult).toBeInstanceOf(ForbiddenException);
        });
      },
    );

    context('when both ctxChild and childId passed', () => {
      const familyId = faker.random.uuid();
      const createAwardsDto: any = {
        childId: faker.random.uuid(),
        awards: [{ id: faker.random.uuid() }, { id: faker.random.uuid() }],
      };
      const parent: any = {
        id: faker.random.uuid(),
        familyId: familyId,
      };
      const ctxChild: any = { id: faker.random.uuid() };
      const childFound = {
        id: faker.random.uuid(),
        familyId: familyId,
      };
      const awardsSaved = [{ id: faker.random.uuid() }];

      let actualResult;

      beforeAll(async () => {
        childrenService.getChild.mockResolvedValue(childFound);
        awardsRepository.save.mockResolvedValue(awardsSaved);

        actualResult = await service.createAwardsGql(
          createAwardsDto,
          parent,
          ctxChild,
        );
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call childrenService.getChild once', () => {
        expect(childrenService.getChild).toBeCalledTimes(1);
        expect(childrenService.getChild).toBeCalledWith({
          id: createAwardsDto.childId,
        });
      });

      it('should call awardsRepository.save', () => {
        expect(awardsRepository.save).toBeCalledTimes(1);
        expect(awardsRepository.save).toBeCalledWith(
          createAwardsDto.awards.map(award => ({
            ...award,
            child: childFound,
          })),
        );
      });

      it('should return expected result', () => {
        expect(actualResult).toEqual(awardsSaved);
      });
    });

    context(
      'when child passed from context and child is part of parent family',
      () => {
        const familyId = faker.random.uuid();
        const createAwardsDto: any = {
          childId: null,
          awards: [{ id: faker.random.uuid() }, { id: faker.random.uuid() }],
        };
        const parent: any = {
          id: faker.random.uuid(),
          familyId,
        };
        const ctxChild: any = { id: faker.random.uuid(), familyId };
        const awardsSaved = [{ id: faker.random.uuid() }];

        let actualResult;

        beforeAll(async () => {
          awardsRepository.save.mockResolvedValue(awardsSaved);

          actualResult = await service.createAwardsGql(
            createAwardsDto,
            parent,
            ctxChild,
          );
        });

        afterAll(() => {
          jest.clearAllMocks();
        });

        it('should not call childrenService.getChild', () => {
          expect(childrenService.getChild).not.toBeCalled();
        });

        it('should call awardsRepository.save', () => {
          expect(awardsRepository.save).toBeCalledTimes(1);
          expect(awardsRepository.save).toBeCalledWith(
            createAwardsDto.awards.map(award => ({
              ...award,
              child: ctxChild,
            })),
          );
        });

        it('should return expected result', () => {
          expect(actualResult).toEqual(awardsSaved);
        });
      },
    );
  });
});
