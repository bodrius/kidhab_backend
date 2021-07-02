import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { NotificationForParentModel } from '@src/modules/notifications/notifications-for-parent/graphql/notification-for-parent.model';
import { InjectRepository } from '@nestjs/typeorm';
import { HabitsRepository } from '../common/habits.repository';

@Resolver(of => NotificationForParentModel)
export class NotificationsForParentHabitResolver {
  constructor(
    @InjectRepository(HabitsRepository)
    private habitsRepository: HabitsRepository,
  ) {}

  @ResolveField()
  async habit(
    @Parent() notificationForParent: NotificationForParentModel,
  ): Promise<any> {
    if (!notificationForParent.habitId) {
      return null;
    }

    return (
      notificationForParent.habit ||
      (await this.habitsRepository.findOne(notificationForParent.habitId))
    );
  }
}
