import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { NotificationForParentModel } from '@src/modules/notifications/notifications-for-parent/graphql/notification-for-parent.model';
import { ChildrenService } from '../common/children.service';

@Resolver(of => NotificationForParentModel)
export class NotificationsForParentChildAuthorResolver {
  constructor(private childrenService: ChildrenService) {}

  @ResolveField()
  async childAuthor(
    @Parent() notificationForParent: NotificationForParentModel,
  ): Promise<any> {
    const { childAuthor, childAuthorId } = notificationForParent;

    return (
      childAuthor ||
      (await this.childrenService.getChild({ id: childAuthorId }))
    );
  }
}
