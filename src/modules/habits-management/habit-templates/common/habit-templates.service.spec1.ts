import { Test, TestingModule } from '@nestjs/testing';
import { HabitTemplatesService } from './habit-templates.service';

describe('HabitTemplatesService', () => {
  let service: HabitTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HabitTemplatesService],
    }).compile();

    service = module.get<HabitTemplatesService>(HabitTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
