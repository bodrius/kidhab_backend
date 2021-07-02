import {MigrationInterface, QueryRunner} from "typeorm";

export class AddMoreCascades1614190062984 implements MigrationInterface {
    name = 'AddMoreCascades1614190062984'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_4145ca2ee7562d554bb73ee09b3"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "FK_201d245d6fea77b9433559ada88"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_4145ca2ee7562d554bb73ee09b3" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "FK_201d245d6fea77b9433559ada88" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "FK_201d245d6fea77b9433559ada88"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_4145ca2ee7562d554bb73ee09b3"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "FK_201d245d6fea77b9433559ada88" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_4145ca2ee7562d554bb73ee09b3" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
