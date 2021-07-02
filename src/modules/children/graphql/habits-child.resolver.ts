import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { HabitModel } from '@src/modules/habits-management/habits/graphql/habit.model';
import { ChildrenService } from '../common/children.service';

@Resolver(of => HabitModel)
export class HabitsChildResolver {
  constructor(private childrenService: ChildrenService) {}

  @ResolveField()
  async child(
    @Parent() habit: HabitModel,
  ): Promise<any> {
    return (
      habit.child ||
      (await this.childrenService.getChild({ id: habit.childId }))
    );
  }
}
