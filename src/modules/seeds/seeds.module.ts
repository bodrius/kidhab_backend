import { Module } from '@nestjs/common';
import { SeedsService } from './seeds.service';
import { SeedsController } from './seeds.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedEntity } from './seeds.entity';
import { HabitCategoryEntity } from '../habits-management/habit-categories/common/habit-category.entity';
import { AwardTemplateEntity } from '../awards-management/award-templates/common/award-template.entity';
import { FamilyEntity } from '../families/common/family.entity';
import { AuthBaseModule } from '@src/modules/auth-management/auth-base/auth-base.module';
import { TasksModule } from '../habits-management/tasks/tasks.module';
import { HabitsRepository } from '../habits-management/habits/common/habits.repository';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { SeedsAdapter } from './seeds.adapter';
import { HabitsModule } from '../habits-management/habits/habits.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SeedEntity,
      HabitCategoryEntity,
      AwardTemplateEntity,
      FamilyEntity,
      HabitsRepository,
    ]),
    AuthBaseModule,
    TasksModule,
    HabitsModule,
    ChecksModule,
  ],
  providers: [SeedsService, SeedsAdapter],
  controllers: [SeedsController],
})
export class SeedsModule {}
