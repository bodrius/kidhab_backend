import {MigrationInterface, QueryRunner} from "typeorm";

export class MoveAccountTypeToFamily1605969894041 implements MigrationInterface {
    name = 'MoveAccountTypeToFamily1605969894041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parents" DROP COLUMN "accountType"`);
        await queryRunner.query(`ALTER TABLE "families" ADD "accountType" character varying NOT NULL DEFAULT 'BASIC'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "families" DROP COLUMN "accountType"`);
        await queryRunner.query(`ALTER TABLE "parents" ADD "accountType" character varying NOT NULL DEFAULT 'BASIC'`);
    }

}
