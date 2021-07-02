import {MigrationInterface, QueryRunner} from "typeorm";

export class AddNotificationsForParentCascadeRemoval1605892956430 implements MigrationInterface {
    name = 'AddNotificationsForParentCascadeRemoval1605892956430'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "FK_419a45eddca88ebb6255b21e7b7"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "FK_9800d2ba37f05833a05f8653907"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "FK_419a45eddca88ebb6255b21e7b7" FOREIGN KEY ("parentReceiverId") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "FK_9800d2ba37f05833a05f8653907" FOREIGN KEY ("childAuthorId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "FK_9800d2ba37f05833a05f8653907"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "FK_419a45eddca88ebb6255b21e7b7"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "FK_9800d2ba37f05833a05f8653907" FOREIGN KEY ("childAuthorId") REFERENCES "children"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "FK_419a45eddca88ebb6255b21e7b7" FOREIGN KEY ("parentReceiverId") REFERENCES "parents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
