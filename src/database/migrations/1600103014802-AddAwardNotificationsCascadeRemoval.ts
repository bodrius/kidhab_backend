import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAwardNotificationsCascadeRemoval1600103014802 implements MigrationInterface {
    name = 'AddAwardNotificationsCascadeRemoval1600103014802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "FK_7e67a527fbd56b72ff2e0ab17c7"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "FK_7e67a527fbd56b72ff2e0ab17c7" FOREIGN KEY ("awardId") REFERENCES "awards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "FK_7e67a527fbd56b72ff2e0ab17c7"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "FK_7e67a527fbd56b72ff2e0ab17c7" FOREIGN KEY ("awardId") REFERENCES "awards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
