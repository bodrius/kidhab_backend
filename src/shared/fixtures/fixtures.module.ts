import { Module } from '@nestjs/common';
import { FixturesService } from './fixtures.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { FamilyEntity } from '@src/modules/families/common/family.entity';
import { SessionEntity } from '@src/modules/sessions/session.entity';
import { AuthBaseModule } from '@src/modules/auth-management/auth-base/auth-base.module';
import { HabitCategoryEntity } from '@src/modules/habits-management/habit-categories/common/habit-category.entity';
import { HabitEntity } from '@src/modules/habits-management/habits/common/habit.entity';
import { HabitTemplateEntity } from '@src/modules/habits-management/habit-templates/common/habit-template.entity';
import { TaskEntity } from '@src/modules/habits-management/tasks/common/task.entity';
import { AwardTemplateEntity } from '@src/modules/awards-management/award-templates/common/award-template.entity';
import { AdminUserEntity } from '@src/modules/admin-users/common/admin-user.entity';
import { AdminRoleEntity } from '@src/modules/admin-users/common/admin-role.entity';
import { AwardsRepository } from '@src/modules/awards-management/awards/common/awards.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ParentEntity,
      ChildEntity,
      FamilyEntity,
      SessionEntity,
      HabitCategoryEntity,
      HabitTemplateEntity,
      HabitEntity,
      AwardsRepository,
      TaskEntity,
      AwardTemplateEntity,
      AdminUserEntity,
      AdminRoleEntity,
    ]),
    AuthBaseModule,
  ],
  providers: [FixturesService],
})
export class FixturesModule {}
