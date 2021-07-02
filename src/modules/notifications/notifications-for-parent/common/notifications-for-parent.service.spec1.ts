import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsForParentService } from './notifications-for-parent.service';

describe('NotificationsService', () => {
  let service: NotificationsForParentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsForParentService],
    }).compile();

    service = module.get<NotificationsForParentService>(NotificationsForParentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
