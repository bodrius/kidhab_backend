import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { NotificationForParentModel } from '@src/modules/notifications/notifications-for-parent/graphql/notification-for-parent.model';
import { ParentsService } from '../common/parents.service';

@Resolver(of => NotificationForParentModel)
export class NotificationsForParentParentReceiverResolver {
  constructor(private parentsService: ParentsService) {}

  @ResolveField()
  async parentReceiver(
    @Parent() notificationForParent: NotificationForParentModel,
  ): Promise<any> {
    const { parentReceiver, parentReceiverId } = notificationForParent;
    return (
      parentReceiver || (await this.parentsService.findById(parentReceiverId))
    );
  }
}
