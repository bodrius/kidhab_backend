import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppendTasksService } from './append-tasks.service';

@Injectable()
export class AppendTasksCron {
  constructor(private appendTasksService: AppendTasksService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async appendTasks(): Promise<void> {
    return this.appendTasksService.appendTasks();
  }
}
