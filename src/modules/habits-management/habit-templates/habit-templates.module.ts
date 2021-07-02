import { Module } from '@nestjs/common';
import { SystemHabitTemplatesController } from './rest/system-habit-templates.controller';
import { HabitTemplatesService } from './common/habit-templates.service';
import { HabitTemplateEntity } from './common/habit-template.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitTemplatesResolver } from './graphql/habit-templates.resolver';
import { HabitCategoriesTemplatesResolver } from './graphql/habit-categories-templates.resolver';
import { SessionsModule } from '@src/modules/sessions/sessions.module';
import { FamiliesHabitTemplatesResolver } from './graphql/families-habit-templates.resolver';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { HabitCategoriesModule } from '../habit-categories/habit-categories.module';
import { HabitTemplatesFieldsResolver } from './graphql/habit-templates.fields-resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([HabitTemplateEntity]),
    SessionsModule,
    ChecksModule,
    HabitCategoriesModule,
  ],
  controllers: [SystemHabitTemplatesController],
  providers: [
    HabitTemplatesService,
    HabitTemplatesResolver,
    HabitTemplatesFieldsResolver,
    HabitCategoriesTemplatesResolver,
    FamiliesHabitTemplatesResolver,
  ],
  exports: [HabitTemplatesService],
})
export class HabitTemplatesModule {}
