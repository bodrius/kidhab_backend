import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamiliesService } from './common/families.service';
import { ParentsFamilyResolver } from './graphql/parents-family.resolver';
import { ChildrenFamilyResolver } from './graphql/children-family.resolver';
import { FamiliesResolver } from './graphql/families.resolver';
import { SessionsModule } from '../sessions/sessions.module';
import { HabitTemplatesModule } from '../habits-management/habit-templates/habit-templates.module';
import { AwardTemplatesModule } from '../awards-management/award-templates/award-templates.module';
import { FamiliesRepository } from './common/families.repository';
import { SystemFamiliesController } from './rest/system-families.controller';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { UpdateFamiliesAccountTypeService } from './crons/update-families-account-type/update-families-account-type.service';
import { PaymentsRepository } from '../payments/common/payments.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([FamiliesRepository, PaymentsRepository]),
    SessionsModule,
    HabitTemplatesModule,
    AwardTemplatesModule,
    ChecksModule,
  ],
  providers: [
    FamiliesService,
    ParentsFamilyResolver,
    ChildrenFamilyResolver,
    FamiliesResolver,
    UpdateFamiliesAccountTypeService,
  ],
  controllers: [SystemFamiliesController],
  exports: [FamiliesService, UpdateFamiliesAccountTypeService],
})
export class FamiliesModule {}
