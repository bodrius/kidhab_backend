import { Module } from '@nestjs/common';
import { AuthBaseService } from './auth-base.service';
import { configModule } from '@src/config/config.module';

@Module({
  imports: [configModule],
  providers: [AuthBaseService],
  exports: [AuthBaseService],
})
export class AuthBaseModule {}
