import { Test, TestingModule } from '@nestjs/testing';
import { HabitCategoriesService } from './habit-categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HabitCategoryEntity } from './habit-category.entity';
import { RepositoryMock } from '@src/shared/mocks';

describe('HabitCategoriesService', () => {
  let service: HabitCategoriesService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HabitCategoriesService,
        {
          provide: getRepositoryToken(HabitCategoryEntity),
          useClass: RepositoryMock,
        },
      ],
    }).compile();

    service = module.get<HabitCategoriesService>(HabitCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
