import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppBaseModule } from './app-base.module';
import { ChildrenModule } from './modules/children/children.module';
import { SetChildCredsReminderCron } from './modules/children/crons/set-child-creds-reminder/set-child-creds-reminder.cron';
import { UpdateFamiliesAccountTypeCron } from './modules/families/crons/update-families-account-type/update-families-account-type.cron';
import { FamiliesModule } from './modules/families/families.module';
import { AppendTasksCron } from './modules/habits-management/habits/crons/append-tasks/append-tasks.cron';
import { MarkOverdueCron } from './modules/habits-management/habits/crons/mark-overdue/mark-overdue.cron';
import { HabitsModule } from './modules/habits-management/habits/habits.module';

@Module({
  imports: [
    AppBaseModule,
    ScheduleModule.forRoot(),
    ChildrenModule,
    HabitsModule,
    FamiliesModule,
  ],
  controllers: [],
  providers: [
    MarkOverdueCron,
    SetChildCredsReminderCron,
    AppendTasksCron,
    UpdateFamiliesAccountTypeCron,
  ],
})
export class AppModule {}
