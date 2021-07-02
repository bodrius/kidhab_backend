import {
  Field,
  ObjectType,
  Int,
  ID,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { ChildModel } from '@src/modules/children/graphql/child.model';
import { TaskStatuses } from '../common/task-statuses.enum';
import { HabitModel } from '../../habits/graphql/habit.model';

@ObjectType()
export class TaskModel {
  @Field(type => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(type => Int)
  points: number;

  @Field(type => TaskStatuses, {
    description: 'Task status. How task already processed (state of task)',
  })
  status: TaskStatuses;

  @Field({ description: 'Day-to-complete task' })
  date: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(type => HabitModel, { nullable: true })
  habit?: HabitModel;

  @Field({ nullable: true })
  habitId?: string;

  @Field(type => ChildModel)
  child: ChildModel;

  @Field()
  childId: string;

  @Field(type => GraphQLISODateTime)
  createdAt: Date;

  @Field(type => GraphQLISODateTime)
  updatedAt: Date;
}
