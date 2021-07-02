import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { ChildEntity } from '../../../children/common/child.entity';
import { HabitsService } from '../common/habits.service';
import { ChildModel } from '@src/modules/children/graphql/child.model';
import { HabitEntity } from '../common/habit.entity';

@Resolver(of => ChildModel)
export class ChildrenHabitsResolver {
  constructor(private habitsService: HabitsService) {}

  @ResolveField()
  async habits(@Parent() child: ChildEntity): Promise<HabitEntity[]> {
    return child.habits || (await this.habitsService.getHabitsByChild(child));
  }
}
