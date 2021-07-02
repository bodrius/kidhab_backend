import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { TokenGuard } from './token.guard';
import { UserTypes } from './user-types.enum';
import { SessionEntity } from '@src/modules/sessions/session.entity';
import { Request } from 'express';
import { AdminPermissions } from '@src/modules/admin-users/common/permissions.enum';

@Injectable()
export class AdminTokenRestGuard extends TokenGuard {
  type = UserTypes.ADMIN;

  getToken(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization ?? '';
    return authHeader.replace('Bearer ', '');
  }

  checkUser(session: SessionEntity, context: ExecutionContext): void {
    const permissions = this.reflector.get<AdminPermissions[]>(
      'permissions',
      context.getHandler(),
    );

    if (!session.adminUser && this.type === UserTypes.ADMIN) {
      throw new UnauthorizedException(
        'This route only accessible for admin users',
      );
    }
    if (session.adminUser.shouldResetPassword) {
      throw new ConflictException(
        `Admin user should reset his password first`,
      );
    }

    if (!permissions || !permissions.length) {
      return;
    }

    const hasOneOfPermissions = permissions.some(perm =>
      session.adminUser.role.permissions.includes(perm),
    );
    if (!hasOneOfPermissions) {
      throw new ForbiddenException(`User does not have right permissions`);
    }
  }

  setRequestUser(session: SessionEntity, context: ExecutionContext): void {
    const request = context.switchToHttp().getRequest<Request>();
    (request as any).admin = session.adminUser;
  }

  setRequestSession(session: SessionEntity, context: ExecutionContext): void {
    const request = context.switchToHttp().getRequest<Request>();
    (request as any).session = session;
  }
}
