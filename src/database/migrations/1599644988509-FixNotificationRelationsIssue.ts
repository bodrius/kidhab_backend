import {MigrationInterface, QueryRunner} from "typeorm";

export class FixNotificationRelationsIssue1599644988509 implements MigrationInterface {
    name = 'FixNotificationRelationsIssue1599644988509'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "FK_201d245d6fea77b9433559ada88"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "FK_7e67a527fbd56b72ff2e0ab17c7"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "REL_201d245d6fea77b9433559ada8"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "REL_7e67a527fbd56b72ff2e0ab17c"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "FK_201d245d6fea77b9433559ada88" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "FK_7e67a527fbd56b72ff2e0ab17c7" FOREIGN KEY ("awardId") REFERENCES "awards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "FK_7e67a527fbd56b72ff2e0ab17c7"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "FK_201d245d6fea77b9433559ada88"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "REL_7e67a527fbd56b72ff2e0ab17c" UNIQUE ("awardId")`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "REL_201d245d6fea77b9433559ada8" UNIQUE ("habitId")`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "FK_7e67a527fbd56b72ff2e0ab17c7" FOREIGN KEY ("awardId") REFERENCES "awards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "FK_201d245d6fea77b9433559ada88" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
