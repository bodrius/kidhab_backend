import { Resolver, Mutation, Args, Context, Query, Info } from '@nestjs/graphql';
import { HabitModel } from './habit.model';
import { HabitsService } from '../common/habits.service';
import { CreateHabitsDto } from '../common/dto/create-habits.dto';
import { ParentTokenGraphqlGuard } from '@src/shared/guards/parent-token-graphql.guard';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { UpdateHabitGqlDto } from '../common/dto/update-habit.dto';
import { SuccessModel } from '@src/graphql/success.model';
import { HabitApprovalDto } from '../common/dto/habit-approval.dto';
import { HabitEntity } from '../common/habit.entity';
import { GraphQLResolveInfo } from 'graphql';
import { RelationMapper } from 'typeorm-graphql-joiner';
import { Connection } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';

@Resolver(of => HabitModel)
@UseGuards(ParentTokenGraphqlGuard)
export class HabitsForParentResolver {
  private relationMapper: RelationMapper;

  constructor(
    @InjectConnection()
    private connection: Connection,
    private habitsService: HabitsService
  ) {
    this.relationMapper = new RelationMapper(this.connection);
  }

  @Mutation(returns => [HabitModel], {
    description:
      'Creates Habits for child.' +
      ' Could be called with childId or after createChild mutation.' +
      ' Throws 404 if some of category ids is not present in DB' +
      ' Throws 403 if child is not member of parents family',
  })
  async createChildHabits(
    @Args() createHabitsDto: CreateHabitsDto,
    @Context('parent') parent: ParentEntity,
    @Context('child') child: ChildEntity,
  ): Promise<any> {
    const habits = await this.habitsService.createHabits(
      createHabitsDto,
      parent,
      child,
    );
    return habits;
  }

  @Query(returns => [HabitModel], {
    description:
      'Gets child habits.' +
      ' Throws 404 if child not found.' +
      ' Throws 403 if child is not member of parents family',
  })
  async getChildHabits(
    @Args('childId') childId: string,
    @Context('parent') parent: ParentEntity,
    @Info() info: GraphQLResolveInfo,
  ): Promise<any> {
    const relations = this.relationMapper.buildRelationListForQuery(
      HabitEntity,
      info,
    );

    return this.habitsService.getChildHabits(childId, parent, [...relations]);
  }

  @Mutation(returns => HabitModel, {
    description:
      'Update child Habit.' +
      ' Throws 404 if child, habit or category id is not present in DB' +
      ' Throws 403 if child is not member of parents family' +
      ' Throws 403 if we trying to change already completed habit',
  })
  async updateChildHabit(
    @Args('habitId') habitId: string,
    @Context('parent') parent: ParentEntity,
    @Args('fields') updateHabitDto: UpdateHabitGqlDto,
  ): Promise<any> {
    return this.habitsService.updateChildHabit(updateHabitDto, habitId, parent);
  }

  @Mutation(returns => HabitModel, {
    description:
      'Review childs Habit draft.' +
      ' Throws 401 if bearer auth failed for parent.' +
      ' Throws 404 if habit or habit draft not found' +
      ' Throws 403 if child does not belong to parent family or habit already completed.',
  })
  async reviewHabitDraft(
    @Args('habitId', ParseUUIDPipe) habitId: string,
    @Args('habitApprovalParams') habitApprovalDto: HabitApprovalDto,
    @Context('parent') parent: ParentEntity,
  ): Promise<any> {
    return this.habitsService.reviewHabitDraft(
      habitId,
      habitApprovalDto,
      parent,
    );
  }

  @Mutation(returns => HabitModel, {
    description:
      'Review habit deletion.' +
      ' Throws 401 if bearer auth failed for parent.' +
      ' Throws 404 if habit not found.' +
      ' Throws 403 if child does not belongs to parent family.',
  })
  async reviewHabitDeletion(
    @Args('habitId', ParseUUIDPipe) habitId: string,
    @Args('habitApprovalParams') habitApprovalDto: HabitApprovalDto,
    @Context('parent') parent: ParentEntity,
  ): Promise<any> {
    return this.habitsService.reviewHabitDeletion(
      habitId,
      habitApprovalDto,
      parent,
    );
  }

  @Mutation(returns => SuccessModel, {
    description:
      'Delete child Habit.' +
      ' Throws 404 if habit not found' +
      ' Throws 403 if child is not member of parents family' +
      ' Throws 403 if we trying to change already completed habit',
  })
  async deleteChildHabit(
    @Args('habitId') habitId: string,
    @Context('parent') parent: ParentEntity,
  ): Promise<SuccessModel> {
    await this.habitsService.deleteHabit(habitId, parent);
    return { success: true };
  }
}
