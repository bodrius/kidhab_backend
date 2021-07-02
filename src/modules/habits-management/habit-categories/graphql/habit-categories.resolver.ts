import { Resolver, Query, Context } from '@nestjs/graphql';
import { HabitCategoryModel } from './habit-category.model';
import { HabitCategoriesService } from '../common/habit-categories.service';
import { UseGuards } from '@nestjs/common';
import { CommonTokenGraphqlGuard } from '@src/shared/guards/common-token-graphql.guard';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { HabitCategoryEntity } from '../common/habit-category.entity';

@Resolver(of => HabitCategoryModel)
@UseGuards(CommonTokenGraphqlGuard)
export class HabitCategoriesResolver {
  constructor(private habitCategoriesService: HabitCategoriesService) {}

  @Query(returns => [HabitCategoryModel], {
    description: 'Get habit categories',
  })
  async habitCategories(
    @Context('user') user: ChildEntity | ParentEntity,
  ): Promise<HabitCategoryEntity[]> {
    return this.habitCategoriesService.getCategoriesWithTemplatesForFamily(
      user.familyId,
    );
  }
}
