import { Module } from '@nestjs/common';
import { SessionsModule } from '@src/modules/sessions/sessions.module';
import { AuthBaseModule } from '@src/modules/auth-management/auth-base/auth-base.module';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { AdminUsersModule } from '@src/modules/admin-users/admin-users.module';
import { AdminUsersAuthService } from './common/admin-users-auth.service';
import { AdminUsersAuthController } from './rest/admin-users-auth.controller';

@Module({
  imports: [SessionsModule, AdminUsersModule, ChecksModule, AuthBaseModule],
  controllers: [AdminUsersAuthController],
  providers: [AdminUsersAuthService],
})
export class AdminUsersAuthModule {}
