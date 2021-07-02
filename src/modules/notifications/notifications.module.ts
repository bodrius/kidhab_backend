import { Module } from '@nestjs/common';
import { NotificationsForParentService } from './notifications-for-parent/common/notifications-for-parent.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationForParentEntity } from './notifications-for-parent/common/notification-for-parent.entity';
import { SessionsModule } from '../sessions/sessions.module';
import { ParentsModule } from '../parents/parents.module';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { NotificationsForParentResolver } from './notifications-for-parent/graphql/notifications-for-parent.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationForParentEntity]),
    SessionsModule,
    ParentsModule,
    ChecksModule,
  ],
  controllers: [],
  providers: [NotificationsForParentService, NotificationsForParentResolver],
  exports: [NotificationsForParentService],
})
export class NotificationsModule {}
