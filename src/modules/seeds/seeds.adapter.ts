import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthBaseService } from '@src/modules/auth-management/auth-base/auth-base.service';
import { HabitTemplateEntity } from '../habits-management/habit-templates/common/habit-template.entity';
import { HabitCategoryEntity } from '../habits-management/habit-categories/common/habit-category.entity';
import { FamilySeedDto } from './dto/family-seed.dto';
import * as _ from 'lodash';
import { HabitEntity } from '../habits-management/habits/common/habit.entity';
import { ChildSeedDto } from './dto/child-seed.dto';
import { DeepPartial } from 'typeorm';
import { FamilyEntity } from '../families/common/family.entity';

@Injectable()
export class SeedsAdapter {
  constructor(private authBaseService: AuthBaseService) {}

  public async prepareFamiliesSeeds(
    familiesSeeds: FamilySeedDto[],
    categories: HabitCategoryEntity[],
  ): Promise<DeepPartial<FamilyEntity[]>> {
    return Promise.all(
      familiesSeeds.map(async familySeeds => {
        const habitTemplates: Partial<
          HabitTemplateEntity
        >[] = this.prepareHabitTemplatesSeeds(familySeeds, categories);

        const parents = await this.prepareParentsSeeds(familySeeds);

        const children = await this.prepareChildrenSeeds(
          familySeeds,
          categories,
        );

        return { ...familySeeds, children, habitTemplates, parents };
      }),
    );
  }

  private prepareHabitTemplatesSeeds(
    familySeeds: FamilySeedDto,
    categories: HabitCategoryEntity[],
  ) {
    return familySeeds.habitTemplates.map(habitTemplateSeed => {
      const targetCategory = this.getCategoryByIndex(
        categories,
        habitTemplateSeed.categoryIndex,
      );

      return {
        ..._.omit(habitTemplateSeed, 'categoryIndex'),
        category: targetCategory,
      };
    });
  }

  private async prepareParentsSeeds(familySeeds: FamilySeedDto) {
    return Promise.all(
      familySeeds.parents.map(async parentSeed => {
        const passwordHash = await this.authBaseService.createPasswordHash(
          parentSeed.password,
        );

        return { ..._.omit(parentSeed, 'password'), passwordHash };
      }),
    );
  }

  private async prepareChildrenSeeds(
    familySeeds: FamilySeedDto,
    categories: HabitCategoryEntity[],
  ) {
    return Promise.all(
      familySeeds.children.map(async childSeed => {
        const habits: Partial<HabitEntity>[] = this.prepareChildHabitsSeeds(
          childSeed,
          categories,
        );
        const passwordHash = await this.authBaseService.createPasswordHash(
          childSeed.password,
        );
        const childCategories = childSeed.categoryIndexes.map(ind =>
          this.getCategoryByIndex(categories, ind),
        );

        return {
          ..._.omit(childSeed, 'password', 'categoryIndexes'),
          habits,
          passwordHash,
          categories: childCategories,
        };
      }),
    );
  }

  private prepareChildHabitsSeeds(
    childSeed: ChildSeedDto,
    categories: HabitCategoryEntity[],
  ) {
    return childSeed.habits.map(habitSeed => {
      const targetCategory = this.getCategoryByIndex(
        categories,
        habitSeed.categoryIndex,
      );

      return {
        ..._.omit(habitSeed, 'categoryIndex', 'draft'),
        draft: {
          ...habitSeed.draft,
          categoryId: targetCategory.id,
        },
        category: targetCategory,
      };
    });
  }

  private getCategoryByIndex(categories: HabitCategoryEntity[], index: number) {
    const targetCategory = categories[index];
    if (!targetCategory) {
      throw new NotFoundException(
        `Habit category with index ${index} not found in seeds`,
      );
    }

    return targetCategory;
  }
}
