import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIsActiveFlagForAward1599288531511 implements MigrationInterface {
    name = 'AddIsActiveFlagForAward1599288531511'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "awards" ADD "isActive" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "awards" DROP COLUMN "isActive"`);
    }

}
