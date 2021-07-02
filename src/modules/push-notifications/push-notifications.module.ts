import { Module } from '@nestjs/common';
import { SessionsModule } from '../sessions/sessions.module';
import { PushNotificationsService } from './push-notifications.service';

@Module({
  imports: [SessionsModule],
  controllers: [],
  providers: [PushNotificationsService],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}
