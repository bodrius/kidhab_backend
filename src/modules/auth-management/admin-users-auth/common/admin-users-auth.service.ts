import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminUsersService } from '@src/modules/admin-users/common/admin-users.service';
import { SessionsService } from '@src/modules/sessions/sessions.service';
import { AuthBaseService } from '@src/modules/auth-management/auth-base/auth-base.service';
import { ChecksService } from '@src/shared/checks/checks.service';
import { AdminUserSignInDto } from '../rest/dto/admin-user-sign-in.dto';
import { ResetPasswordDto } from '../rest/dto/reset-password.dto';
import { AdminUserAuthSerializer } from '../rest/serializers/admin-user-auth.serializer';

@Injectable()
export class AdminUsersAuthService {
  constructor(
    private authBaseService: AuthBaseService,
    private adminUsersService: AdminUsersService,
    private checksService: ChecksService,
    private sessionsService: SessionsService,
  ) {}

  async signIn({
    email,
    password,
  }: AdminUserSignInDto): Promise<AdminUserAuthSerializer> {
    const adminUser = await this.adminUsersService.findAdminUser({ email });

    this.checksService.checkEntityExistence(adminUser, email, 'Admin User');
    const isRightPassword = await this.authBaseService.comparePasswords(
      password,
      adminUser.passwordHash,
    );
    if (!isRightPassword) {
      throw new UnauthorizedException('Password is wrong');
    }

    const session = await this.sessionsService.createForAdminUser(adminUser);
    const token = this.authBaseService.createToken(session);

    return { user: adminUser, token };
  }

  async resetPassword({
    email,
    oldPassword,
    newPassword,
  }: ResetPasswordDto): Promise<void> {
    const adminUser = await this.adminUsersService.findAdminUser({ email });

    this.checksService.checkEntityExistence(adminUser, email, 'Admin user');
    if (!adminUser.shouldResetPassword) {
      throw new ForbiddenException(`Password already resettled`);
    }

    const isRightOldPassword = await this.authBaseService.comparePasswords(
      oldPassword,
      adminUser.passwordHash,
    );
    if (!isRightOldPassword) {
      throw new UnauthorizedException('Old password is wrong');
    }

    const newPasswordHash = await this.authBaseService.createPasswordHash(
      newPassword,
    );

    await this.adminUsersService.updateAdminUser(adminUser, {
      passwordHash: newPasswordHash,
      shouldResetPassword: false,
    });
  }
}
