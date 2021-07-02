import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ChildrenService } from '../../../children/common/children.service';
import { ChildStatuses } from '../../../children/common/child-statuses.enum';
import { AuthBaseService } from '@src/modules/auth-management/auth-base/auth-base.service';
import { SessionsService } from '../../../sessions/sessions.service';
import { ChildEntity } from '../../../children/common/child.entity';
import { SetChildCredsDto } from './dto/set-child-creds.dto';
import { ChildrenSignInDto } from './dto/children-sign-in.dto';
import { ChecksService } from '@src/shared/checks/checks.service';
import { SessionEntity } from '@src/modules/sessions/session.entity';
import { PushNotificationsService } from '@src/modules/push-notifications/push-notifications.service';

@Injectable()
export class ChildrenAuthService {
  constructor(
    private childrenService: ChildrenService,
    private sessionsService: SessionsService,
    private authBaseService: AuthBaseService,
    private pushNotificationsService: PushNotificationsService,
    private checksService: ChecksService,
  ) {}

  async activateChild(
    inviteHash: string,
  ): Promise<{ child: ChildEntity; token: string }> {
    const child = await this.childrenService.getChild({ inviteHash });
    this.checksService.checkEntityExistence(
      child,
      inviteHash,
      'Child by invite hash',
    );

    const updatedChild = await this.childrenService.updateChild(child, {
      inviteHash: null,
      status: ChildStatuses.ACTIVATED,
    });

    const session = await this.sessionsService.createForChild(updatedChild);
    const token = this.authBaseService.createToken(session);
    await this.pushNotificationsService.sendChildActivated(updatedChild);

    return { child: updatedChild, token };
  }

  async setChildCreds(
    child: ChildEntity,
    setChildCredsDto: SetChildCredsDto,
  ): Promise<{ child: ChildEntity }> {
    const { email, password } = setChildCredsDto;
    const existingChildWithEmail = await this.childrenService.getChild({
      email,
    });
    if (existingChildWithEmail) {
      throw new ConflictException(`Child with email '${email}' already exists`);
    }

    const passwordHash = await this.authBaseService.createPasswordHash(password);
    const updatedChild = await this.childrenService.updateChild(child, {
      email,
      passwordHash,
    });

    return { child: updatedChild };
  }

  async signIn({
    email,
    password,
  }: ChildrenSignInDto): Promise<{ child: ChildEntity; token: string }> {
    const child = await this.childrenService.getChild({ email });
    this.checksService.checkEntityExistence(child, email, 'Child');

    const isRightPassword = await this.authBaseService.comparePasswords(
      password,
      child.passwordHash ?? '',
    );
    if (!isRightPassword) {
      throw new UnauthorizedException('Password is wrong');
    }

    const session = await this.sessionsService.createForChild(child);
    const token = this.authBaseService.createToken(session);

    return { child, token };
  }

  async getLoggedChild(childId: string): Promise<ChildEntity> {
    return this.childrenService.getChildWithHabitsAndAwards(childId);
  }

  async setChildDeviceToken(
    session: SessionEntity,
    deviceToken: string,
  ): Promise<void> {
    await this.sessionsService.updateSession(session, { deviceToken });
  }

  async logOutChild(session: SessionEntity): Promise<void> {
    await this.sessionsService.dropSession(session);
  }
}
