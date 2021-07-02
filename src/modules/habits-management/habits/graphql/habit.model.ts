import {
  Field,
  ObjectType,
  Int,
  ID,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { HabitCategoryWithoutTemplatesModel } from '../../habit-categories//graphql/habit-category.model';
import { ChildWithoutNestedArraysModel } from '@src/modules/children/graphql/child.model';
import { HabitDraftModel } from './habit-draft.model';

@ObjectType()
export class HabitModel {
  @Field(type => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(type => Int, { nullable: true })
  points?: number;

  @Field()
  status: string;

  @Field({
    nullable: true,
    description: 'habit reccurence (postgres inverval string)',
  })
  reccurence?: string;

  @Field({
    nullable: true,
    description: 'habit base/start date (ISO date)',
  })
  baseDate?: string;

  @Field({
    nullable: true,
    description:
      'how much times habit tasks should be completed in order to finish habit',
  })
  timesToComplete?: number;

  @Field(type => Int)
  timesToCompleteLevel: number;

  @Field(type => Int)
  timesToCompleteLevelLeft: number;

  @Field(type => Int)
  habitLevel: number;

  @Field(type => ID, { nullable: true })
  categoryId?: string;

  @Field(type => HabitCategoryWithoutTemplatesModel, { nullable: true })
  category?: HabitCategoryWithoutTemplatesModel;

  @Field(type => HabitDraftModel, {
    nullable: true,
    description: 'Habit draft (which fields child asks to modify in habit)',
  })
  draft?: HabitDraftModel;

  @Field(type => ChildWithoutNestedArraysModel)
  child: ChildWithoutNestedArraysModel;

  @Field(type => ID)
  childId: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(type => GraphQLISODateTime)
  createdAt: Date;

  @Field(type => GraphQLISODateTime)
  updatedAt: Date;
}
