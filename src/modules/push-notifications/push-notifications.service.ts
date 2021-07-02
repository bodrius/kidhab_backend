import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as _ from 'lodash';
import { SessionsService } from '../sessions/sessions.service';
import { TaskEntity } from '../habits-management/tasks/common/task.entity';
import { TaskStatuses } from '../habits-management/tasks/common/task-statuses.enum';
import { ChildEntity } from '../children/common/child.entity';
import { ConfigService } from '@nestjs/config';
import { ParentEntity } from '../parents/common/parent.entity';
import { AwardEntity } from '../awards-management/awards/common/award.entity';
import { ParentNotificationsTypes } from '@src/shared/interfaces/parent-notifications-types.enum';
import { HabitEntity } from '../habits-management/habits/common/habit.entity';
import { ChildNotificationsTypes } from '@src/shared/interfaces/child-notifications-types.enum';
import { NotificationForParentEntity } from '../notifications/notifications-for-parent/common/notification-for-parent.entity';
import { pushTranslations, TranslationContext } from './push-translations';
import { SessionEntity } from '../sessions/session.entity';

@Injectable()
export class PushNotificationsService {
  private logger = new Logger('Push Notifications');

  private firebaseApp: admin.app.App;
  private messaging: admin.messaging.Messaging;
  private commonOptions: Partial<admin.messaging.MulticastMessage> = {
    android: {
      priority: 'high',
    },
    apns: {
      headers: {
        'apns-priority': '10',
      },
    },
  };

  constructor(
    private sessionsService: SessionsService,
    private configService: ConfigService,
  ) {
    if (configService.get('general.env') === 'test') {
      return;
    }

    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    this.messaging = admin.messaging(this.firebaseApp);
  }

  async sendWaitingForApprovalMessage(
    task: TaskEntity,
    child: ChildEntity,
  ): Promise<void> {
    const parentsSessions = await this.sessionsService.getFamilyParentsSessionsForPush(
      child.familyId,
    );

    const sessionsByParent = _(parentsSessions)
      .groupBy(s => s.parentId)
      .values()
      .valueOf();

    await Promise.all(
      sessionsByParent.map(async sessions => {
        await this.sendMulticast(
          {
            taskId: task.id,
            childId: child.id,
            type: TaskStatuses.PENDING_APPROVAL,
          },
          sessions,
          TaskStatuses.PENDING_APPROVAL,
          { childUsername: child.username },
        );
      }),
    );
  }

  async sendReviewedMessage(
    task: TaskEntity,
    child: ChildEntity,
  ): Promise<void> {
    const sessions = await this.sessionsService.getChildSessionsForPush([
      child.id,
    ]);

    await this.sendMulticast(
      {
        taskId: task.id,
        type: task.status,
      },
      sessions,
      task.status,
    );
  }

  async sendAwardDraftChange(
    notifications: NotificationForParentEntity[],
    child: ChildEntity,
    isCreateRequested: boolean,
  ): Promise<void> {
    await Promise.all(
      notifications.map(async notification => {
        const sessions = await this.sessionsService.getParentSessionsForPush(
          notification.parentReceiver.id,
        );

        const notificationType = isCreateRequested
          ? ParentNotificationsTypes.AWARD_CREATION_REQUESTED
          : ParentNotificationsTypes.AWARD_UPDATE_REQUESTED;

        await this.sendMulticast(
          {
            childId: child.id,
            awardId: notification.award.id,
            notificationId: notification.id,
            type: notificationType,
          },
          sessions,
          notificationType,
          { childUsername: child.username },
        );
      }),
    );
  }

  async sendHabitDraftChange(
    notifications: NotificationForParentEntity[],
    child: ChildEntity,
    isCreateRequested: boolean,
  ): Promise<void> {
    await Promise.all(
      notifications.map(async notification => {
        const sessions = await this.sessionsService.getParentSessionsForPush(
          notification.parentReceiver.id,
        );

        const notificationType = isCreateRequested
          ? ParentNotificationsTypes.HABIT_CREATION_REQUESTED
          : ParentNotificationsTypes.HABIT_UPDATE_REQUESTED;

        await this.sendMulticast(
          {
            childId: child.id,
            habitId: notification.habit.id,
            notificationId: notification.id,
            type: notificationType,
          },
          sessions,
          notificationType,
          { childUsername: child.username },
        );
      }),
    );
  }

  async sendHabitDeletionRequested(
    notifications: NotificationForParentEntity[],
    child: ChildEntity,
  ): Promise<void> {
    await Promise.all(
      notifications.map(async notification => {
        const sessions = await this.sessionsService.getParentSessionsForPush(
          notification.parentReceiver.id,
        );

        await this.sendMulticast(
          {
            childId: child.id,
            habitId: notification.habit.id,
            notificationId: notification.id,
            type: ParentNotificationsTypes.HABIT_DELETION_REQUESTED,
          },
          sessions,
          ParentNotificationsTypes.HABIT_DELETION_REQUESTED,
          { childUsername: child.username },
        );
      }),
    );
  }

  async sendHabitLevelChange(
    habit: HabitEntity,
    child: ChildEntity,
  ): Promise<void> {
    const sessions = await this.sessionsService.getChildSessionsForPush([
      child.id,
    ]);

    await this.sendMulticast(
      {
        habitId: habit.id,
        type: ChildNotificationsTypes.HABIT_LEVEL_CHANGE,
      },
      sessions,
      ChildNotificationsTypes.HABIT_LEVEL_CHANGE,
      { habitName: habit.name, habitLevel: habit.habitLevel },
    );
  }

  async sendHabitCompleted(
    habit: HabitEntity,
    child: ChildEntity,
  ): Promise<void> {
    const sessions = await this.sessionsService.getChildSessionsForPush([
      child.id,
    ]);

    await this.sendMulticast(
      {
        habitId: habit.id,
        type: ChildNotificationsTypes.HABIT_COMPLETED,
      },
      sessions,
      ChildNotificationsTypes.HABIT_COMPLETED,
      { habitName: habit.name, childUsername: child.username },
    );
  }

  async sendChildActivated(child: ChildEntity): Promise<void> {
    const parentsSessions = await this.sessionsService.getFamilyParentsSessionsForPush(
      child.familyId,
    );

    const sessionsByParent = _(parentsSessions)
      .groupBy(s => s.parentId)
      .values()
      .valueOf();

    await Promise.all(
      sessionsByParent.map(async sessions => {
        await this.sendMulticast(
          {
            childId: child.id,
            type: ParentNotificationsTypes.CHILD_ACTIVATED,
          },
          sessions,
          ParentNotificationsTypes.CHILD_ACTIVATED,
          { childUsername: child.username },
        );
      }),
    );
  }

  async sendOneTimeTaskAdded(task: TaskEntity): Promise<void> {
    const sessions = await this.sessionsService.getChildSessionsForPush([
      task.childId,
    ]);

    await this.sendMulticast(
      {
        taskId: task.id,
        type: ChildNotificationsTypes.ONE_TIME_TASK_ADDED,
      },
      sessions,
      ChildNotificationsTypes.ONE_TIME_TASK_ADDED,
      { taskName: task.name },
    );
  }

  async sendAwardPurchased(
    child: ChildEntity,
    award: AwardEntity,
  ): Promise<void> {
    const parentsSessions = await this.sessionsService.getFamilyParentsSessionsForPush(
      child.familyId,
    );

    const sessionsByParent = _(parentsSessions)
      .groupBy(s => s.parentId)
      .values()
      .valueOf();

    await Promise.all(
      sessionsByParent.map(async sessions => {
        await this.sendMulticast(
          {
            childId: child.id,
            awardId: award.id,
            type: ParentNotificationsTypes.AWARD_PURCHASED,
          },
          sessions,
          ParentNotificationsTypes.AWARD_PURCHASED,
          { childUsername: child.username },
        );
      }),
    );
  }

  async sendSetCreds(childIds: string[]): Promise<void> {
    const childrenSessions = await this.sessionsService.getChildSessionsForPush(
      childIds,
    );

    const sessionsByChild = _(childrenSessions)
      .groupBy(s => s.childId)
      .values()
      .valueOf();

    await Promise.all(
      sessionsByChild.map(async sessions => {
        await this.sendMulticast(
          {
            type: ChildNotificationsTypes.SET_CREDS,
          },
          sessions,
          ChildNotificationsTypes.SET_CREDS,
        );
      }),
    );
  }

  async sendAwardUpdated(
    child: ChildEntity,
    award: AwardEntity,
  ): Promise<void> {
    const sessions = await this.sessionsService.getChildSessionsForPush([
      child.id,
    ]);

    await this.sendMulticast(
      { awardId: award.id, type: ChildNotificationsTypes.AWARD_UPDATED },
      sessions,
      ChildNotificationsTypes.AWARD_UPDATED,
    );
  }

  async sendAwardReviewed(
    child: ChildEntity,
    award: AwardEntity,
    isApproved: boolean,
  ): Promise<void> {
    const sessions = await this.sessionsService.getChildSessionsForPush([
      child.id,
    ]);
    const type = isApproved
      ? ChildNotificationsTypes.AWARD_APPROVED
      : ChildNotificationsTypes.AWARD_REJECTED;

    await this.sendMulticast({ awardId: award.id, type }, sessions, type);
  }

  private async sendMulticast(
    data: Record<string, any>,
    sessions: SessionEntity[],
    pushType: string,
    translationCtx: TranslationContext = {},
  ) {
    const [session] = sessions;
    const user = session?.child || session?.parent;
    if (!sessions.length || !user) {
      return;
    }
    const translations = this.getTranslations(pushType, user);

    const notification: admin.messaging.Notification = {
      body: translations.body(translationCtx),
    };
    if (translations.title) {
      notification.title = translations.title(translationCtx);
    }

    const response = await this.messaging.sendMulticast({
      ...this.commonOptions,
      data,
      notification,
      tokens: sessions.map(({ deviceToken }) => deviceToken),
    });
    this.logSendPushError(response);
  }

  private async logSendPushError(response: admin.messaging.BatchResponse) {
    if (response.failureCount) {
      this.logger.warn(response.responses);
    }
  }

  private getTranslations(pushType: string, user: ParentEntity | ChildEntity) {
    const { language } = user;
    const translations = pushTranslations.find(trans => trans.type === pushType)
      .translations;

    return translations[language];
  }
}
