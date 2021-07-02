import { Module } from '@nestjs/common';
import { ParentsService } from './common/parents.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentsRepository } from './common/parents.repository';
import { FamiliesParentsResolver } from './graphql/families-parents.resolver';
import { ParentsResolver } from './graphql/parents.resolver';
import { SessionsModule } from '../sessions/sessions.module';
import { NotificationsForParentParentReceiverResolver } from './graphql/notifications-for-parent-parent-receiver.resolver';
import { ChecksModule } from '@src/shared/checks/checks.module';
import { SystemParentsController } from './rest/system-parents.controller';
import { FamiliesModule } from '../families/families.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParentsRepository]),
    SessionsModule,
    ChecksModule,
    FamiliesModule,
  ],
  providers: [
    ParentsService,
    FamiliesParentsResolver,
    ParentsResolver,
    NotificationsForParentParentReceiverResolver,
  ],
  controllers: [SystemParentsController],
  exports: [ParentsService],
})
export class ParentsModule {}
