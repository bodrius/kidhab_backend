import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UpdateFamiliesAccountTypeService } from './update-families-account-type.service';

@Injectable()
export class UpdateFamiliesAccountTypeCron {
  constructor(
    private updateFamiliesAccountTypeService: UpdateFamiliesAccountTypeService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendSetCredsReminders(): Promise<void> {
    return this.updateFamiliesAccountTypeService.updateFamiliesAccountType();
  }
}
