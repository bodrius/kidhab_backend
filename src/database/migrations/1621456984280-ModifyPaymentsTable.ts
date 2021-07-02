import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyPaymentsTable1621456984280 implements MigrationInterface {
  name = 'ModifyPaymentsTable1621456984280';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "payments"."subscriptionId" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "UQ_2017d0cbfdbfec6b1b388e6aa08" UNIQUE ("subscriptionId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "UQ_2017d0cbfdbfec6b1b388e6aa08"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payments"."subscriptionId" IS NULL`,
    );
  }
}
