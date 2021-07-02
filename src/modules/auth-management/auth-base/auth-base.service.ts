import * as jwt from 'jsonwebtoken';
import * as bcryptjs from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@src/modules/auth-management/jwtPayload.interface';
import { SessionEntity } from '@src/modules/sessions/session.entity';

@Injectable()
export class AuthBaseService {
  constructor(private configService: ConfigService) {}

  public async createPasswordHash(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>(
      'encrypt.bcrypt.saltRounds',
    );

    return bcryptjs.hash(password, saltRounds);
  }

  public async comparePasswords(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcryptjs.compare(password, passwordHash);
  }

  public createToken(session: SessionEntity): string {
    const tokenPayload: JwtPayload = { sid: session.id };
    const jwtSecret = this.configService.get<string>('encrypt.jwt.secret');
    const expiresIn = this.configService.get<number>('encrypt.jwt.expiresIn');

    return jwt.sign(tokenPayload, jwtSecret, { expiresIn });
  }
}
