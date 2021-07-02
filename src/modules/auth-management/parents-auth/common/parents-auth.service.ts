import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as appleSignIn from 'apple-signin-auth';
import { ParentsSignUpDto } from './dto/parents-sign-up.dto';
import { ParentsSignInDto } from './dto/parents-sign-in.dto';
import { SessionsService } from '@src/modules/sessions/sessions.service';
import { ParentsService } from '@src/modules/parents/common/parents.service';
import { AuthBaseService } from '@src/modules/auth-management/auth-base/auth-base.service';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { IParentWithToken } from './parent-with-token.interface';
import { FamiliesService } from '@src/modules/families/common/families.service';
import { SessionEntity } from '@src/modules/sessions/session.entity';
import { Languages } from '@src/shared/interfaces/languages.enum';

@Injectable()
export class ParentsAuthService {
  constructor(
    private parentsService: ParentsService,
    private sessionsService: SessionsService,
    private familiesService: FamiliesService,
    private authBaseService: AuthBaseService,
  ) {}

  async signUp({
    email,
    password,
    language,
  }: ParentsSignUpDto): Promise<IParentWithToken> {
    const existingParent = await this.parentsService.findByEmail(email);
    if (existingParent) {
      throw new ConflictException('Parent with such email already exists');
    }

    const family = await this.familiesService.create();

    const passwordHash = await this.authBaseService.createPasswordHash(
      password,
    );
    const newParent = await this.parentsService.create({
      email,
      passwordHash,
      family,
      language,
    });

    const newSession = await this.sessionsService.createForParent(newParent);
    const newToken = this.authBaseService.createToken(newSession);

    return { parent: newParent, token: newToken };
  }

  async signIn({
    email,
    password,
  }: ParentsSignInDto): Promise<IParentWithToken> {
    const parent = await this.parentsService.findByEmail(email);
    if (!parent) {
      throw new NotFoundException('Parent with such email does not exist');
    }

    const isRightPassword = await this.authBaseService.comparePasswords(
      password,
      parent.passwordHash,
    );
    if (!isRightPassword) {
      throw new UnauthorizedException('Password is wrong');
    }

    const session = await this.sessionsService.createForParent(parent);
    const token = this.authBaseService.createToken(session);

    return { parent, token };
  }

  async signInGoogle(parent: ParentEntity): Promise<IParentWithToken> {
    const session = await this.sessionsService.createForParent(parent);
    const token = this.authBaseService.createToken(session);

    return { parent, token };
  }

  async signInApple(
    identityToken: string,
    language: Languages,
  ): Promise<IParentWithToken> {
    const { email } = await appleSignIn.verifyIdToken(identityToken);

    const parent = await this.parentsService.upsert(email, { language });
    const parentWithFamily = await this.addParentToFamilyIfNew(parent);
    const session = await this.sessionsService.createForParent(
      parentWithFamily,
    );
    const token = this.authBaseService.createToken(session);

    return { parent: parentWithFamily, token };
  }

  async setParentDeviceToken(
    session: SessionEntity,
    deviceToken: string,
  ): Promise<void> {
    await this.sessionsService.updateSession(session, { deviceToken });
  }

  async logOutParent(session: SessionEntity): Promise<void> {
    await this.sessionsService.dropSession(session);
  }

  private async addParentToFamilyIfNew(
    parent: ParentEntity,
  ): Promise<ParentEntity> {
    if (parent.familyId) {
      return parent;
    }
    const family = await this.familiesService.create();

    return this.parentsService.update(parent, { family });
  }
}
