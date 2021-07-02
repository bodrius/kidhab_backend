import { registerEnumType } from '@nestjs/graphql';

export enum ChildNotificationsTypes {
  HABIT_LEVEL_CHANGE = 'HABIT_LEVEL_CHANGE',
  HABIT_COMPLETED = 'HABIT_COMPLETED',
  ONE_TIME_TASK_ADDED = 'ONE_TIME_TASK_ADDED',
  SET_CREDS = 'SET_CREDS',
  AWARD_UPDATED = 'AWARD_UPDATED',
  AWARD_APPROVED = 'AWARD_APPROVED',
  AWARD_REJECTED = 'AWARD_REJECTED',
}

registerEnumType(ChildNotificationsTypes, {
  name: 'NotificationsTypes',
});
