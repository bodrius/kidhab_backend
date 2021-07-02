import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { HabitModel } from './habit.model';
import { HabitsService } from '../common/habits.service';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { ChildTokenGraphqlGuard } from '@src/shared/guards/child-token-graphql.guard';
import { CreateHabitDto } from '../common/dto/create-habit.dto';
import { UpdateHabitGqlDto } from '../common/dto/update-habit.dto';

@Resolver(of => HabitModel)
@UseGuards(ChildTokenGraphqlGuard)
export class HabitsForChildResolver {
  constructor(private habitsService: HabitsService) {}

  @Mutation(returns => HabitModel, {
    description:
      'Creates Habits for child.' +
      ' Could be called with childId or after createChild mutation.' +
      ' Throws 401 if bearer authorization failed for child.' +
      ' Throws 404 if some of category ids is not present in DB.' +
      ' Throws 403 if child is not member of parents family.',
  })
  async createChildHabitFromDraft(
    @Args() createHabitDto: CreateHabitDto,
    @Context('child') child: ChildEntity,
  ): Promise<any> {
    return this.habitsService.createHabitFromDraft(createHabitDto, child);
  }

  @Mutation(returns => HabitModel, {
    description:
      'Updates habit draft.' +
      ' Throws 401 if bearer authorization failed for child.' +
      ' Throws 404 if habit not found.' +
      ' Throws 403 if child trying to update not his habit.',
  })
  async updateChildHabitDraft(
    @Args('habitId', ParseUUIDPipe) habitId: string,
    @Args('updateParams') updateParams: UpdateHabitGqlDto,
    @Context('child') child: ChildEntity,
  ): Promise<any> {
    return this.habitsService.updateChildHabitDraft(
      updateParams,
      habitId,
      child,
    );
  }

  @Mutation(returns => HabitModel, {
    description:
      'Request habit deletion.' +
      ' Throws 401 if bearer authorization failed for child.' +
      ' Throws 404 if habit not found.' +
      ' Throws 403 if child asking for deletion of non-his habit',
  })
  async requestHabitDeletion(
    @Args('habitId', ParseUUIDPipe) habitId: string,
    @Context('child') child: ChildEntity,
  ): Promise<any> {
    return this.habitsService.requestHabitDeletion(habitId, child);
  }
}
