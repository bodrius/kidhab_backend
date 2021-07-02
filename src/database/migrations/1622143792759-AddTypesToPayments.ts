import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypesToPayments1622143792759 implements MigrationInterface {
  name = 'AddTypesToPayments1622143792759';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "type" character varying NOT NULL DEFAULT 'apple'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "type"`);
  }
}
