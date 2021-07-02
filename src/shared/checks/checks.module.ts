import { Module } from '@nestjs/common';
import { ChecksService } from './checks.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ChecksService],
  exports: [ChecksService],
})
export class ChecksModule {}
