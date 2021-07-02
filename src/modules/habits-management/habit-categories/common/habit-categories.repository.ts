import {
  DeepPartial,
  EntityRepository,
  FindConditions,
  Repository,
} from 'typeorm';
import { HabitCategoryStatuses } from './habit-category-statuses.enum';
import { HabitCategoryEntity } from './habit-category.entity';

@EntityRepository(HabitCategoryEntity)
export class HabitCategoriesRepository extends Repository<HabitCategoryEntity> {
  async getHabitCategoriesWithTemplates(
    familyId: string,
  ): Promise<HabitCategoryEntity[]> {
    return this.createQueryBuilder('habit_categories')
      .leftJoinAndSelect(
        'habit_categories.templates',
        'templates',
        'templates."familyId" = :familyId',
        { familyId },
      )
      .where('habit_categories.status != :status', {
        status: HabitCategoryStatuses.DELETED,
      })
      .getMany();
  }

  async findCategory(
    criteria: FindConditions<HabitCategoryEntity>,
  ): Promise<HabitCategoryEntity> {
    return this.findOne({ ...criteria, status: HabitCategoryStatuses.ACTIVE });
  }

  async updateHabitCategory(
    habitCategory: HabitCategoryEntity,
    updateParams: DeepPartial<HabitCategoryEntity>,
  ): Promise<HabitCategoryEntity> {
    const habitCategoryToUpdate = this.merge(habitCategory, updateParams);
    return this.save(habitCategoryToUpdate);
  }
}
