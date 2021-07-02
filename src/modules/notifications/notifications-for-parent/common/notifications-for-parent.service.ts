import { Injectable } from '@nestjs/common';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationForParentEntity } from './notification-for-parent.entity';
import { Repository, DeepPartial } from 'typeorm';
import { ParentNotificationsTypes } from '../../../../shared/interfaces/parent-notifications-types.enum';
import { ParentsService } from '@src/modules/parents/common/parents.service';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { prepareNotificationText } from './notification-text.mapper';
import { ChecksService } from '@src/shared/checks/checks.service';

@Injectable()
export class NotificationsForParentService {
  constructor(
    @InjectRepository(NotificationForParentEntity)
    private notificationsForParentRepository: Repository<
      NotificationForParentEntity
    >,
    private parentsService: ParentsService,
    private checksService: ChecksService,
  ) {}

  async getParentNotifications(
    parent: ParentEntity,
    relations: string[] = [],
  ): Promise<NotificationForParentEntity[]> {
    return this.notificationsForParentRepository.find({
      where: { parentReceiver: { id: parent.id } },
      relations,
    });
  }

  async addAwardNotificationForFamilyParents(
    child: ChildEntity,
    awardId: string,
    notificationType: ParentNotificationsTypes,
  ): Promise<NotificationForParentEntity[]> {
    return this.addNotificationForFamilyParents(
      child,
      notificationType,
      awardId,
    );
  }

  async addHabitNotificationForFamilyParents(
    habitId: string,
    child: ChildEntity,
    notificationType: ParentNotificationsTypes,
  ): Promise<NotificationForParentEntity[]> {
    return this.addNotificationForFamilyParents(
      child,
      notificationType,
      null,
      habitId,
    );
  }

  async deleteParentNotification(
    notificationId: string,
    parent: ParentEntity,
  ): Promise<void> {
    const notification = await this.notificationsForParentRepository.findOne(
      notificationId,
    );

    this.checksService.checkEntityExistence(
      notification,
      notificationId,
      'Notification',
    );
    this.checksService.checkParentNotificationReceiver(notification, parent);

    await this.notificationsForParentRepository.remove(notification);
  }

  async removeNotificationsForHabit(habitId: string): Promise<void> {
    await this.notificationsForParentRepository.delete({
      habit: { id: habitId },
    });
  }

  async removeNotificationsForAward(awardId: string): Promise<void> {
    await this.notificationsForParentRepository.delete({
      award: { id: awardId },
    });
  }

  private async addNotificationForFamilyParents(
    child: ChildEntity,
    notificationType: ParentNotificationsTypes,
    awardId: string = null,
    habitId: string = null,
  ): Promise<NotificationForParentEntity[]> {
    const existingNotification = await this.findExisting(
      notificationType,
      awardId,
      habitId,
    );
    if (existingNotification) {
      return;
    }

    const familyParents = await this.parentsService.findByFamilyId(
      child.familyId,
    );

    const parentsNotifications = familyParents.map<
      DeepPartial<NotificationForParentEntity>
    >(parent => ({
      description: prepareNotificationText(notificationType, child),
      type: notificationType,
      parentReceiver: parent,
      childAuthor: child,
      award: awardId ? { id: awardId } : null,
      habit: habitId ? { id: habitId } : null,
    }));

    return this.notificationsForParentRepository.save(parentsNotifications);
  }

  private async findExisting(
    notificationType: ParentNotificationsTypes,
    awardId: string = null,
    habitId: string = null,
  ) {
    return this.notificationsForParentRepository.findOne({
      award: awardId ? { id: awardId } : null,
      habit: habitId ? { id: habitId } : null,
      type: notificationType,
    });
  }
}
