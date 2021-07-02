import * as faker from 'faker';
import { Test, TestingModule } from '@nestjs/testing';
import { ParentsService } from './parents.service';
import { ParentsRepository } from './parents.repository';
import { FamiliesServiceMock, ParentsRepositoryMock } from '@src/shared/mocks';
import { repositoryMocks } from '@src/shared/mocks/mock-all-repos';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { FamiliesService } from '@src/modules/families/common/families.service';

describe('ParentsService', () => {
  let service: ParentsService;
  let parentsRepository: ParentsRepositoryMock;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ChecksModule],
      providers: [
        ...repositoryMocks,
        ParentsService,
        { provide: FamiliesService, useClass: FamiliesServiceMock },
      ],
    }).compile();

    service = module.get<ParentsService>(ParentsService);
    parentsRepository = module.get(ParentsRepository);
  });

  describe('#create', () => {
    const email = faker.internet.email();
    const passwordHash = faker.random.words();
    const family: any = { id: faker.random.uuid() };
    const createdParent = { id: faker.random.uuid() };

    let actualResult;

    beforeAll(async () => {
      parentsRepository.save.mockResolvedValue(createdParent);

      actualResult = await service.create({ email, passwordHash, family });
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should call parentsRepository.save once', () => {
      expect(parentsRepository.save).toBeCalledTimes(1);
      expect(parentsRepository.save).toBeCalledWith({
        email,
        passwordHash,
        family,
      });
    });

    it('should return expected result', () => {
      expect(actualResult).toEqual(createdParent);
    });
  });

  describe('#findByEmail', () => {
    const email = faker.internet.email();
    const parentFound = { id: faker.random.uuid() };

    let actualResult;

    beforeAll(async () => {
      parentsRepository.findOne.mockResolvedValue(parentFound);

      actualResult = await service.findByEmail(email);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should call parentsRepository.findOne once', () => {
      expect(parentsRepository.findOne).toBeCalledTimes(1);
      expect(parentsRepository.findOne).toBeCalledWith({
        email,
      });
    });

    it('should return expected result', () => {
      expect(actualResult).toEqual(parentFound);
    });
  });

  describe('#findById', () => {
    const id = faker.random.uuid();
    const parentFound = { id: faker.random.uuid() };

    let actualResult;

    beforeAll(async () => {
      parentsRepository.findOne.mockResolvedValue(parentFound);

      actualResult = await service.findById(id);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should call parentsRepository.findOne once', () => {
      expect(parentsRepository.findOne).toBeCalledTimes(1);
      expect(parentsRepository.findOne).toBeCalledWith(id);
    });

    it('should return expected result', () => {
      expect(actualResult).toEqual(parentFound);
    });
  });

  describe('#findByFamilyId', () => {
    const familyId = faker.random.uuid();
    const parentsFound = [{ id: faker.random.uuid() }];

    let actualResult;

    beforeAll(async () => {
      parentsRepository.find.mockResolvedValue(parentsFound);

      actualResult = await service.findByFamilyId(familyId);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should call parentsRepository.find once', () => {
      expect(parentsRepository.find).toBeCalledTimes(1);
      expect(parentsRepository.find).toBeCalledWith({
        family: { id: familyId },
      });
    });

    it('should return expected result', () => {
      expect(actualResult).toEqual(parentsFound);
    });
  });

  describe('#upsert', () => {
    const email = faker.internet.email();
    const username = faker.name.firstName();
    const parentFoundOrCreated = { id: faker.random.uuid() };

    let actualResult;

    beforeAll(async () => {
      parentsRepository.upsert.mockResolvedValue(parentFoundOrCreated);

      actualResult = await service.upsert(email, { username });
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should call parentsRepository.upsert once', () => {
      expect(parentsRepository.upsert).toBeCalledTimes(1);
      expect(parentsRepository.upsert).toBeCalledWith(email, { username });
    });

    it('should return expected result', () => {
      expect(actualResult).toEqual(parentFoundOrCreated);
    });
  });

  describe('#update', () => {
    const parentToUpdate: any = { id: faker.random.uuid() };
    const paramsToUpdate = { username: faker.name.firstName() };

    const parentMerged = {
      id: faker.random.uuid(),
      username: faker.name.firstName(),
    };
    const parentUpdated = { id: faker.random.uuid() };

    let actualResult;

    beforeAll(async () => {
      parentsRepository.merge.mockReturnValue(parentMerged);
      parentsRepository.save.mockResolvedValue(parentUpdated);

      actualResult = await service.update(parentToUpdate, paramsToUpdate);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should call parentsRepository.merge once', () => {
      expect(parentsRepository.merge).toBeCalledTimes(1);
      expect(parentsRepository.merge).toBeCalledWith(
        parentToUpdate,
        paramsToUpdate,
      );
    });

    it('should call parentsRepository.save once', () => {
      expect(parentsRepository.save).toBeCalledTimes(1);
      expect(parentsRepository.save).toBeCalledWith(parentMerged);
    });

    it('should return expected result', () => {
      expect(actualResult).toEqual(parentUpdated);
    });
  });
});
