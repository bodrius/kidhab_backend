import { Module } from '@nestjs/common';
import { AwardTemplatesService } from './common/award-templates.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwardTemplateEntity } from './common/award-template.entity';
import { SystemAwardTemplatesController } from './rest/system-award-templates.controller';
import { AwardTemplatesResolver } from './graphql/award-templates.resolver';
import { SessionsModule } from '@src/modules/sessions/sessions.module';
import { FamiliesAwardTemplatesResolver } from './graphql/families-award-templates.resolver';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { AwardTemplatesFieldsResolver } from './graphql/award-templates.fields-resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([AwardTemplateEntity]),
    SessionsModule,
    ChecksModule,
  ],
  providers: [
    AwardTemplatesService,
    AwardTemplatesResolver,
    AwardTemplatesFieldsResolver,
    FamiliesAwardTemplatesResolver,
  ],
  exports: [AwardTemplatesService],
  controllers: [SystemAwardTemplatesController],
})
export class AwardTemplatesModule {}
