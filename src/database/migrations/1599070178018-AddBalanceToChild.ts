import {MigrationInterface, QueryRunner} from "typeorm";

export class AddBalanceToChild1599070178018 implements MigrationInterface {
    name = 'AddBalanceToChild1599070178018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children" ADD "balance" integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children" DROP COLUMN "balance"`);
    }

}
