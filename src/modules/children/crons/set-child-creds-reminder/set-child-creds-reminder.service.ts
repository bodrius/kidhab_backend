import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChildrenRepository } from '../../common/children.repository';
import { PushNotificationsService } from '@src/modules/push-notifications/push-notifications.service';

@Injectable()
export class SetChildCredsReminderService {
  private readonly logger = new Logger(SetChildCredsReminderService.name);

  constructor(
    @InjectRepository(ChildrenRepository)
    private childrenRepository: ChildrenRepository,
    private pushNotificationsService: PushNotificationsService,
  ) {}

  async sendSetCredsReminders(): Promise<void> {
    this.logger.debug('cron started');

    const childrenWithoutCreds = await this.childrenRepository.getChildrenWithoutCreds();
    const childrenIdsWithoutCreds = childrenWithoutCreds.map(child => child.id);

    await this.pushNotificationsService.sendSetCreds(childrenIdsWithoutCreds);

    this.logger.debug('cron finished');
  }
}
