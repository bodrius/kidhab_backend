import {
  Resolver,
  Mutation,
  Args,
  Context,
  Query,
  Info,
} from '@nestjs/graphql';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ParentTokenGraphqlGuard } from '@src/shared/guards/parent-token-graphql.guard';
import { NotificationForParentModel } from './notification-for-parent.model';
import { NotificationsForParentService } from '../common/notifications-for-parent.service';
import { SuccessModel } from '@src/graphql/success.model';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { RelationMapper } from 'typeorm-graphql-joiner';
import { NotificationForParentEntity } from '../common/notification-for-parent.entity';
import { GraphQLResolveInfo } from 'graphql';

@Resolver(of => NotificationForParentModel)
@UseGuards(ParentTokenGraphqlGuard)
export class NotificationsForParentResolver {
  private relationMapper: RelationMapper;

  constructor(
    @InjectConnection()
    private connection: Connection,
    private notificationsForParentService: NotificationsForParentService,
  ) {
    this.relationMapper = new RelationMapper(this.connection);
  }

  @Query(returns => [NotificationForParentModel], {
    description:
      'Create new child in family.' +
      ' Throws 404 if some of category ids not found in DB',
  })
  async parentNotifications(
    @Context('parent') parent: ParentEntity,
    @Info() info: GraphQLResolveInfo,
  ): Promise<any> {
    const relations = this.relationMapper.buildRelationListForQuery(
      NotificationForParentEntity,
      info,
    );

    return this.notificationsForParentService.getParentNotifications(parent, [
      ...relations,
    ]);
  }

  @Mutation(returns => SuccessModel, {
    description:
      'Upsert invite hash for child.' +
      ' Throws 404 if child not found.' +
      ' Throws 403 if child is not member of parents family',
  })
  async deleteParentNotification(
    @Context('parent') parent: ParentEntity,
    @Args('notificationId', ParseUUIDPipe) notificationId: string,
  ): Promise<SuccessModel> {
    await this.notificationsForParentService.deleteParentNotification(
      notificationId,
      parent,
    );

    return { success: true };
  }
}
