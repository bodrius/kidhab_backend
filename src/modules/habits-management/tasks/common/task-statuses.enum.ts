import { registerEnumType } from '@nestjs/graphql';

export enum TaskStatuses {
  CREATED = 'CREATED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  OVERDUE = 'OVERDUE',
}

registerEnumType(TaskStatuses, {
  name: 'TaskStatuses',
});
