import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { GqlContext } from '@src/graphql/graphql-context.interface';
import { HabitEntity } from '../../habits/common/habit.entity';
import { HabitModel } from '../../habits/graphql/habit.model';
import { HabitCategoriesService } from '../common/habit-categories.service';

@Resolver(of => HabitModel)
export class HabitsCategoryResolver {
  constructor(private habitCategoriesService: HabitCategoriesService) {}

  @ResolveField()
  async category(
    @Parent() habit: HabitEntity,
    @Context() ctx: GqlContext,
  ): Promise<any> {
    if (!habit.categoryId) {
      return null;
    }

    return (
      habit.category ||
      (await this.habitCategoriesService.getCategory({
        id: habit.categoryId,
      }))
    );
  }
}
