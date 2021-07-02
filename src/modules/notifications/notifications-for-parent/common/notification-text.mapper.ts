import { ParentNotificationsTypes } from '../../../../shared/interfaces/parent-notifications-types.enum';
import { ChildEntity } from '@src/modules/children/common/child.entity';

const NotificationTextMap = {
  [ParentNotificationsTypes.HABIT_CREATION_REQUESTED]:
    '${username} requested new habit creation',
  [ParentNotificationsTypes.HABIT_UPDATE_REQUESTED]:
    '${username} requested habit update',
  [ParentNotificationsTypes.HABIT_DELETION_REQUESTED]:
    '${username} asked to delete habit',

  [ParentNotificationsTypes.AWARD_CREATION_REQUESTED]:
    '${username} asked to create award',
  [ParentNotificationsTypes.AWARD_UPDATE_REQUESTED]:
    '${username} asked to update award',
};

const usernameTextRegexp = /\$\{username\}/g;

export function prepareNotificationText(
  type: ParentNotificationsTypes,
  child: ChildEntity,
): string {
  const notificationTextTemplate = NotificationTextMap[type];

  return notificationTextTemplate.replace(usernameTextRegexp, child.username);
}
