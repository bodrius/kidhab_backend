import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAwardStatus1605774039439 implements MigrationInterface {
    name = 'AddAwardStatus1605774039439'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "awards" ADD "status" character varying NOT NULL DEFAULT 'CREATED'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "awards" DROP COLUMN "status"`);
    }

}
