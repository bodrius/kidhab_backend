import { registerEnumType } from '@nestjs/graphql';

export enum NotificationsStatuses {
  ACTIVE = 'ACTIVE',
}

registerEnumType(NotificationsStatuses, {
  name: 'NotificationsStatuses',
});
