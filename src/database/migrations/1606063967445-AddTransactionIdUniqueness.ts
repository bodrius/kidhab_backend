import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTransactionIdUniqueness1606063967445 implements MigrationInterface {
    name = 'AddTransactionIdUniqueness1606063967445'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "UQ_c39d78e8744809ece8ca95730e2" UNIQUE ("transactionId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "UQ_c39d78e8744809ece8ca95730e2"`);
    }

}
