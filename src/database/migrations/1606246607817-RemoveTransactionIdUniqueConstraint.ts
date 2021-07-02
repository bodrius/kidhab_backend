import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveTransactionIdUniqueConstraint1606246607817 implements MigrationInterface {
    name = 'RemoveTransactionIdUniqueConstraint1606246607817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "UQ_c39d78e8744809ece8ca95730e2"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "UQ_c39d78e8744809ece8ca95730e2" UNIQUE ("transactionId")`);
    }

}
