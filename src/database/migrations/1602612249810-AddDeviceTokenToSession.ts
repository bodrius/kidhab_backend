import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDeviceTokenToSession1602612249810 implements MigrationInterface {
    name = 'AddDeviceTokenToSession1602612249810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "deviceToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "deviceToken"`);
    }

}
