import { Module, forwardRef } from '@nestjs/common';
import { HabitsService } from './common/habits.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitCategoriesModule } from '../habit-categories/habit-categories.module';
import { ChildrenModule } from '@src/modules/children/children.module';
import { SessionsModule } from '@src/modules/sessions/sessions.module';
import { HabitsForParentResolver } from './graphql/habits-for-parent.resolver';
import { ChildrenHabitsResolver } from './graphql/children-habits.resolver';
import { TasksModule } from '../tasks/tasks.module';
import { NotificationsModule } from '@src/modules/notifications/notifications.module';
import { HabitsRepository } from './common/habits.repository';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { HabitsForChildResolver } from './graphql/habits-for-child.resolver';
import { HabitsBaseResolver } from './graphql/habits-base.resolver';
import { NotificationsForParentHabitResolver } from './graphql/notifications-for-parent-award.resolver';
import { HabitLevelsService } from './common/habit-levels.service';
import { PushNotificationsModule } from '@src/modules/push-notifications/push-notifications.module';
import { HabitTemplatesModule } from '../habit-templates/habit-templates.module';
import { MarkOverdueService } from './crons/mark-overdue/mark-overdue.service';
import { AppendTasksService } from './crons/append-tasks/append-tasks.service';
import { HabitDraftsFieldsResolver } from './graphql/habit-drafts.fields-resolver';
import { TasksRepository } from '../tasks/common/tasks.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([HabitsRepository, TasksRepository]),
    HabitCategoriesModule,
    forwardRef(() => ChildrenModule),
    SessionsModule,
    TasksModule,
    NotificationsModule,
    ChecksModule,
    PushNotificationsModule,
    HabitTemplatesModule,
  ],
  providers: [
    HabitsService,
    HabitLevelsService,
    HabitsForParentResolver,
    HabitsForChildResolver,
    HabitsBaseResolver,
    HabitDraftsFieldsResolver,
    ChildrenHabitsResolver,
    MarkOverdueService,
    AppendTasksService,
    NotificationsForParentHabitResolver,
  ],
  controllers: [],
  exports: [
    HabitsService,
    HabitLevelsService,
    MarkOverdueService,
    AppendTasksService,
  ],
})
export class HabitsModule {}
