import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { SessionsService } from '@src/modules/sessions/sessions.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../modules/auth-management/jwtPayload.interface';
import { UserTypes } from './user-types.enum';
import { SessionEntity } from '@src/modules/sessions/session.entity';
import { Reflector } from '@nestjs/core';

@Injectable()
export abstract class TokenGuard implements CanActivate {
  protected abstract type: UserTypes;
  protected abstract checkUser(session: SessionEntity, context?: ExecutionContext): void;
  protected abstract setRequestUser(
    session: SessionEntity,
    context: ExecutionContext,
  ): void;
  protected abstract setRequestSession(
    session: SessionEntity,
    context: ExecutionContext,
  ): void;
  protected abstract getToken(context: ExecutionContext): string;

  constructor(
    private sessionsService: SessionsService,
    private configService: ConfigService,
    protected reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = this.getToken(context);
    const payload = this.verifyToken(token);

    const session = await this.sessionsService.getById(payload.sid);
    if (!session) {
      throw new UnauthorizedException();
    }

    this.checkUser(session, context);
    this.setRequestUser(session, context);
    this.setRequestSession(session, context);

    return true;
  }

  private verifyToken(token: string): JwtPayload {
    const jwtSecret = this.configService.get<string>('encrypt.jwt.secret');

    try {
      return jwt.verify(token, jwtSecret);
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
