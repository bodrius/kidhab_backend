import { Module, forwardRef } from '@nestjs/common';
import { AwardsService } from './common/awards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwardsForParentResolver } from './graphql/awards-for-parent.resolver';
import { ChildrenModule } from '@src/modules/children/children.module';
import { SessionsModule } from '@src/modules/sessions/sessions.module';
import { ChildrenAwardsResolver } from './graphql/children-awards.resolver';
import { NotificationsModule } from '@src/modules/notifications/notifications.module';
import { ActiveAwardsService } from './common/active-awards.service';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { AwardsForChildResolver } from './graphql/awards-for-child.resolver';
import { NotificationsForParentAwardResolver } from './graphql/notifications-for-parent-award.resolver';
import { PushNotificationsModule } from '@src/modules/push-notifications/push-notifications.module';
import { AwardsRepository } from './common/awards.repository';
import { AwardTemplatesModule } from '../award-templates/award-templates.module';
import { AwardsFieldsResolver } from './graphql/awards.fields-resolver';
import { AwardDraftsFieldsResolver } from './graphql/award-drafts.fields-resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([AwardsRepository]),
    forwardRef(() => ChildrenModule),
    SessionsModule,
    NotificationsModule,
    ChecksModule,
    PushNotificationsModule,
    AwardTemplatesModule,
  ],
  controllers: [],
  providers: [
    AwardsService,
    ActiveAwardsService,
    AwardsForParentResolver,
    AwardsForChildResolver,
    AwardsFieldsResolver,
    AwardDraftsFieldsResolver,
    ChildrenAwardsResolver,
    NotificationsForParentAwardResolver,
  ],
  exports: [AwardsService, ActiveAwardsService],
})
export class AwardsModule {}
