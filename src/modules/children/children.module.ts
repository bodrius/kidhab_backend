import { Module, forwardRef } from '@nestjs/common';
import { ChildrenService } from './common/children.service';
import { HabitsModule } from '../habits-management/habits/habits.module';
import { AwardsModule } from '../awards-management/awards/awards.module';
import { HabitCategoriesModule } from '../habits-management/habit-categories/habit-categories.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsModule } from '../sessions/sessions.module';
import { ParentsModule } from '../parents/parents.module';
import { ChildrenResolver } from './graphql/children.resolver';
import { FamiliesChildrenResolver } from './graphql/families-children.resolver';
import { HabitsChildResolver } from './graphql/habits-child.resolver';
import { ChildrenRepository } from './common/children.repository';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { TasksChildResolver } from './graphql/tasks-child.resolver';
import { AwardsChildResolver } from './graphql/awards-child.resolver';
import { NotificationsForParentChildAuthorResolver } from './graphql/notifications-for-parent-child-author.resolver';
import { SystemChildrenController } from './rest/system-children.controller';
import { PushNotificationsModule } from '../push-notifications/push-notifications.module';
import { SetChildCredsReminderService } from './crons/set-child-creds-reminder/set-child-creds-reminder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChildrenRepository]),
    forwardRef(() => HabitsModule),
    HabitCategoriesModule,
    AwardsModule,
    SessionsModule,
    ParentsModule,
    ChecksModule,
    PushNotificationsModule,
  ],
  controllers: [SystemChildrenController],
  providers: [
    ChildrenService,
    ChildrenResolver,
    FamiliesChildrenResolver,
    HabitsChildResolver,
    TasksChildResolver,
    AwardsChildResolver,
    NotificationsForParentChildAuthorResolver,
    SetChildCredsReminderService,
  ],
  exports: [ChildrenService, SetChildCredsReminderService],
})
export class ChildrenModule {}
