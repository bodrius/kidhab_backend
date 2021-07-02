import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MarkOverdueService } from './mark-overdue.service';

@Injectable()
export class MarkOverdueCron {
  constructor(private markOverdueService: MarkOverdueService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async updateHabitsAndTasks(): Promise<void> {
    return this.markOverdueService.updateHabitsAndTasks();
  }
}
