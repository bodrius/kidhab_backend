import { Module } from '@nestjs/common';
import { ChildrenAuthService } from './common/children-auth.service';
import { ChildrenModule } from '@src/modules/children/children.module';
import { SessionsModule } from '@src/modules/sessions/sessions.module';
import { AuthBaseModule } from '@src/modules/auth-management/auth-base/auth-base.module';
import { ChildrenAuthResolver } from './graphql/children-auth.resolver';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { PushNotificationsModule } from '@src/modules/push-notifications/push-notifications.module';

@Module({
  imports: [
    ChildrenModule,
    SessionsModule,
    AuthBaseModule,
    PushNotificationsModule,
    ChecksModule,
  ],
  controllers: [],
  providers: [ChildrenAuthService, ChildrenAuthResolver],
})
export class ChildrenAuthModule {}
