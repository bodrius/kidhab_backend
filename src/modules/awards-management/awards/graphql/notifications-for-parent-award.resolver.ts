import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { NotificationForParentModel } from '@src/modules/notifications/notifications-for-parent/graphql/notification-for-parent.model';
import { AwardsService } from '../common/awards.service';

@Resolver(of => NotificationForParentModel)
export class NotificationsForParentAwardResolver {
  constructor(private awardsService: AwardsService) {}

  @ResolveField()
  async award(
    @Parent() notificationForParent: NotificationForParentModel,
  ): Promise<any> {
    if (!notificationForParent.awardId) {
      return null;
    }

    return (
      notificationForParent.award ||
      (await this.awardsService.getById(notificationForParent.awardId))
    );
  }
}
