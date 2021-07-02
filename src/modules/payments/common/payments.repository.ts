import { DeepPartial, EntityRepository, Repository } from 'typeorm';
import { PaymentEntity } from './payment.entity';

@EntityRepository(PaymentEntity)
export class PaymentsRepository extends Repository<PaymentEntity> {
  async upsertPayment(paymentInfo: DeepPartial<PaymentEntity>): Promise<void> {
    await this.createQueryBuilder('payments')
      .insert()
      .values(paymentInfo)
      .onConflict(
        `
          ("subscriptionId") DO UPDATE SET
            "transactionId" = excluded."transactionId",
            "expiresAt" = excluded."expiresAt",
            "purchasedAt" = excluded."purchasedAt",
            "familyId" = excluded."familyId",
            "parentId" = excluded."parentId"
        `,
      )
      .execute();
  }
}
