import { Module } from '@nestjs/common';
import { ParentsAuthController } from './rest/parents-auth.controller';
import { ParentsAuthService } from './common/parents-auth.service';
import { SessionsModule } from '@src/modules/sessions/sessions.module';
import { configModule } from '@src/config/config.module';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './rest/strategies/google.strategy';
import { ParentsModule } from '@src/modules/parents/parents.module';
import { AuthBaseModule } from '@src/modules/auth-management/auth-base/auth-base.module';
import { FamiliesModule } from '@src/modules/families/families.module';
import { ParentsAuthResolver } from './graphql/parents-auth.resolver';

@Module({
  imports: [
    ParentsModule,
    SessionsModule,
    configModule,
    PassportModule,
    AuthBaseModule,
    FamiliesModule,
  ],
  controllers: [ParentsAuthController],
  providers: [ParentsAuthService, ParentsAuthResolver, GoogleStrategy],
})
export class ParentsAuthModule {}
