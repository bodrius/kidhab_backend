import { Test, TestingModule } from '@nestjs/testing';
import { AwardTemplatesService } from './award-templates.service';

describe('AwardTemplatesService', () => {
  let service: AwardTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwardTemplatesService],
    }).compile();

    service = module.get<AwardTemplatesService>(AwardTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
