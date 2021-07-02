import { Field, ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { ChildWithoutNestedArraysModel } from '@src/modules/children/graphql/child.model';
import { ParentNotificationsTypes } from '../../../../shared/interfaces/parent-notifications-types.enum';
import { NotificationsStatuses } from '../../notifications-statuses.enum';
import { ParentModel } from '@src/modules/parents/graphql/parent.model';
import { HabitModel } from '@src/modules/habits-management/habits/graphql/habit.model';
import { AwardModel } from '@src/modules/awards-management/awards/graphql/award.model';

@ObjectType()
export class NotificationForParentModel {
  @Field(type => ID)
  id: string;

  @Field()
  description: string;

  @Field(type => ParentNotificationsTypes, {
    description:
      'Parent notification type. Describes what action he should be notified about',
  })
  type: ParentNotificationsTypes;

  @Field(type => NotificationsStatuses, {
    description:
      'parent notification status. Meaning how it is already processed',
  })
  status: NotificationsStatuses;

  @Field(type => ID)
  parentReceiverId: string;

  @Field(type => ID)
  childAuthorId: string;

  @Field(type => ID, {
    nullable: true,
    description: 'habit id to which this notification relates',
  })
  habitId?: string;

  @Field(type => ID, {
    nullable: true,
    description: 'award id to which this notification relates',
  })
  awardId?: string;

  @Field(type => ChildWithoutNestedArraysModel)
  childAuthor: ChildWithoutNestedArraysModel;

  @Field(type => ParentModel)
  parentReceiver: ParentModel;

  @Field(type => HabitModel, {
    nullable: true,
    description: 'habit to which this notification relates',
  })
  habit?: HabitModel;

  @Field(type => AwardModel, {
    nullable: true,
    description: 'award to which this notification relates',
  })
  award?: AwardModel;

  @Field(type => GraphQLISODateTime)
  createdAt: Date;

  @Field(type => GraphQLISODateTime)
  updatedAt: Date;
}
