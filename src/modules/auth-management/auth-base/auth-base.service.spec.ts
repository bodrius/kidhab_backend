import { Test, TestingModule } from '@nestjs/testing';
import { AuthBaseService } from './auth-base.service';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthBaseService, ConfigService],
    }).compile();

    service = module.get<AuthBaseService>(AuthBaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
