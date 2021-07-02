import * as faker from 'faker';
import { Test, TestingModule } from '@nestjs/testing';
import { FamiliesService } from './families.service';
import { RepositoryMock } from '@src/shared/mocks';
import { HabitTemplatesService } from '@src/modules/habits-management/habit-templates/common/habit-templates.service';
import { AwardTemplatesService } from '@src/modules/awards-management/award-templates/common/award-templates.service';
import { HabitTemplatesServiceMock } from '@src/shared/mocks/services/habit-templates.service.mock';
import { AwardTemplatesServiceMock } from '@src/shared/mocks/services/award-templates.service.mock';
import { repositoryMocks } from '@src/shared/mocks/mock-all-repos';
import { FamiliesRepository } from './families.repository';
import { ChecksService } from '@src/shared/checks/checks.service';
import { ConfigService } from '@nestjs/config';
import { PaymentsRepository } from '@src/modules/payments/common/payments.repository';

describe('FamiliesService', () => {
  let service: FamiliesService;
  let familyRepository: RepositoryMock;
  let habitTemplatesService: HabitTemplatesServiceMock;
  let awardTemplateService: AwardTemplatesServiceMock;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...repositoryMocks,
        FamiliesService,
        ChecksService,
        { provide: HabitTemplatesService, useClass: HabitTemplatesServiceMock },
        { provide: AwardTemplatesService, useClass: AwardTemplatesServiceMock },
        PaymentsRepository,
        ConfigService,
      ],
    }).compile();

    service = module.get<FamiliesService>(FamiliesService);
    familyRepository = module.get(FamiliesRepository);
    habitTemplatesService = module.get(HabitTemplatesService);
    awardTemplateService = module.get(AwardTemplatesService);
  });

  describe('#create', () => {
    const params = { name: faker.name.firstName() };
    const familyCreated = { id: faker.random.uuid() };

    let actualResult;

    beforeAll(async () => {
      familyRepository.save.mockResolvedValue(familyCreated);

      actualResult = await service.create(params);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should call familyRepository.save once', () => {
      expect(familyRepository.save).toBeCalledTimes(1);
      expect(familyRepository.save).toBeCalledWith(params);
    });

    it('should call HabitTemplatesService.createHabitTemplatesForFamily once', () => {
      expect(
        habitTemplatesService.createHabitTemplatesForFamily,
      ).toBeCalledTimes(1);
      expect(
        habitTemplatesService.createHabitTemplatesForFamily,
      ).toBeCalledWith(familyCreated);
    });

    it('should call awardTemplateService.createAwardTemplatesForFamily once', () => {
      expect(
        awardTemplateService.createAwardTemplatesForFamily,
      ).toBeCalledTimes(1);
      expect(awardTemplateService.createAwardTemplatesForFamily).toBeCalledWith(
        familyCreated,
      );
    });

    it('should return expected result', () => {
      expect(actualResult).toEqual(familyCreated);
    });
  });

  describe('#getById', () => {
    const familyId = faker.random.uuid();
    const familyFound = { id: faker.random.uuid() };

    let actualResult;

    beforeAll(async () => {
      familyRepository.findOne.mockResolvedValue(familyFound);

      actualResult = await service.getById(familyId);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should call familyRepository.findOne once', () => {
      expect(familyRepository.findOne).toBeCalledTimes(1);
      expect(familyRepository.findOne).toBeCalledWith(familyId, {
        relations: [],
      });
    });

    it('should return expected result', () => {
      expect(actualResult).toEqual(familyFound);
    });
  });
});
