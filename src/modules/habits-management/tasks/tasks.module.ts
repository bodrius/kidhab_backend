import { Module, forwardRef } from '@nestjs/common';
import { TasksService } from './common/tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsModule } from '@src/modules/sessions/sessions.module';
import { ChildrenModule } from '@src/modules/children/children.module';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { TasksFieldsResolver } from './graphql/tasks.fields-resolver';
import { TasksForParentResolver } from './graphql/tasks-for-parent.resolver';
import { TasksForChildResolver } from './graphql/tasks-for-child.resolver';
import { HabitsRepository } from '../habits/common/habits.repository';
import { HabitLevelsService } from '../habits/common/habit-levels.service';
import { PushNotificationsModule } from '@src/modules/push-notifications/push-notifications.module';
import { TasksRepository } from './common/tasks.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TasksRepository, HabitsRepository]),
    SessionsModule,
    forwardRef(() => ChildrenModule),
    PushNotificationsModule,
    ChecksModule,
  ],
  providers: [
    TasksService,
    HabitLevelsService,
    TasksFieldsResolver,
    TasksForParentResolver,
    TasksForChildResolver,
  ],
  controllers: [],
  exports: [TasksService],
})
export class TasksModule {}
