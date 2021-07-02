import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SetChildCredsReminderService } from './set-child-creds-reminder.service';

@Injectable()
export class SetChildCredsReminderCron {
  constructor(
    private setChildCredsReminderService: SetChildCredsReminderService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async sendSetCredsReminders(): Promise<void> {
    return this.setChildCredsReminderService.sendSetCredsReminders();
  }
}
