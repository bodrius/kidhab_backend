import { Module } from '@nestjs/common';
import { configModule } from './config/config.module';
import { databaseModule } from './database/database.module';
import { ParentsAuthModule } from './modules/auth-management/parents-auth/parents-auth.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { HabitsModule } from './modules/habits-management/habits/habits.module';
import { HabitTemplatesModule } from './modules/habits-management/habit-templates/habit-templates.module';
import { HabitCategoriesModule } from './modules/habits-management/habit-categories/habit-categories.module';
import { ChildrenModule } from './modules/children/children.module';
import { FamiliesModule } from './modules/families/families.module';
import { AwardsModule } from './modules/awards-management/awards/awards.module';
import { TasksModule } from './modules/habits-management/tasks/tasks.module';
import { AwardTemplatesModule } from './modules/awards-management/award-templates/award-templates.module';
import { ParentsModule } from './modules/parents/parents.module';
import { AuthBaseModule } from './modules/auth-management/auth-base/auth-base.module';
import { ChildrenAuthModule } from './modules/auth-management/children-auth/children-auth.module';
import { graphQLModule } from './graphql/graphql.module';
import { FixturesModule } from './shared/fixtures/fixtures.module';
import { HealthModule } from './modules/health/health.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { AdminUsersAuthModule } from './modules/auth-management/admin-users-auth/admin-users-auth.module';
import { devModules } from './dev.modules';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    configModule,
    databaseModule,
    ParentsAuthModule,
    SessionsModule,
    HabitsModule,
    HabitTemplatesModule,
    HabitCategoriesModule,
    ChildrenModule,
    FamiliesModule,
    AwardsModule,
    TasksModule,
    AwardTemplatesModule,
    ParentsModule,
    AuthBaseModule,
    ChildrenAuthModule,
    AdminUsersModule,
    AdminUsersAuthModule,
    graphQLModule,
    FixturesModule,
    HealthModule,
    NotificationsModule,
    PaymentsModule,
    ...devModules,
  ],
  controllers: [],
  providers: [],
})
export class AppBaseModule {}
