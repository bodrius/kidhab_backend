import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamiliesModule } from '../families/families.module';
import { SessionsModule } from '../sessions/sessions.module';
import { AppleInAppPurchasesClient } from './common/apple-in-app-purchases.client';
import { PaymentsRepository } from './common/payments.repository';
import { PaymentsService } from './common/payments.service';
import { PaymentsResolver } from './graphql/payments.resolver';
import { PaymentsController } from './rest/payments.controller';

@Module({
  imports: [
    FamiliesModule,
    SessionsModule,
    TypeOrmModule.forFeature([PaymentsRepository]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsResolver, AppleInAppPurchasesClient],
})
export class PaymentsModule {}
