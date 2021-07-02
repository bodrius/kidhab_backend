import {MigrationInterface, QueryRunner} from "typeorm";

export class AddShouldResetPasswordFlag1604243886082 implements MigrationInterface {
    name = 'AddShouldResetPasswordFlag1604243886082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin_users" ADD "shouldResetPassword" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin_users" DROP COLUMN "shouldResetPassword"`);
    }

}
