import { Strategy, StrategyOptions } from 'passport-google-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ParentsService } from '@src/modules/parents/common/parents.service';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';

interface GoogleOAuthProfile {
  displayName: string;
  email: string;
  picture: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private parentsService: ParentsService,
  ) {
    super({
      clientID: configService.get('googleOAuth.clientID'),
      clientSecret: configService.get('googleOAuth.clientSecret'),
      callbackURL: configService.get('googleOAuth.callbackUrl'),
      scope: [
        'https://www.googleapis.com/auth/plus.login',
        'https://www.googleapis.com/auth/plus.profile.emails.read',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleOAuthProfile,
  ): Promise<ParentEntity> {
    return this.parentsService.upsert(profile.email, {
      username: profile.displayName,
    });
  }
}
