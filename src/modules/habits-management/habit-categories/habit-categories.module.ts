import { Module } from '@nestjs/common';
import { HabitCategoriesService } from './common/habit-categories.service';
import { SystemHabitCategoriesController } from './rest/system-habit-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitCategoriesResolver } from './graphql/habit-categories.resolver';
import { HabitTemplatesCategoryResolver } from './graphql/habit-templates-category.resolver';
import { HabitsCategoryResolver } from './graphql/habits-category.resolver';
import { SessionsModule } from '@src/modules/sessions/sessions.module';
import { HabitCategoriesRepository } from './common/habit-categories.repository';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { HabitCategoriesFieldsResolver, HabitCategoryWithoutTemplatesFieldsResolver } from './graphql/habit-categories.fields-resolver';

@Module({
  imports: [
    SessionsModule,
    TypeOrmModule.forFeature([HabitCategoriesRepository]),
    ChecksModule,
  ],
  providers: [
    HabitCategoriesService,
    HabitCategoriesResolver,
    HabitCategoriesFieldsResolver,
    HabitCategoryWithoutTemplatesFieldsResolver,
    HabitTemplatesCategoryResolver,
    HabitsCategoryResolver,
  ],
  controllers: [SystemHabitCategoriesController],
  exports: [HabitCategoriesService],
})
export class HabitCategoriesModule {}
