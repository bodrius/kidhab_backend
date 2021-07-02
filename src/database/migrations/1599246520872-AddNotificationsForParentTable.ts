import {MigrationInterface, QueryRunner} from "typeorm";

export class AddNotificationsForParentTable1599246520872 implements MigrationInterface {
    name = 'AddNotificationsForParentTable1599246520872'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notifications_for_parent" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "type" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "parentReceiverId" uuid, "childAuthorId" uuid, "habitId" uuid, "awardId" uuid, CONSTRAINT "REL_201d245d6fea77b9433559ada8" UNIQUE ("habitId"), CONSTRAINT "REL_7e67a527fbd56b72ff2e0ab17c" UNIQUE ("awardId"), CONSTRAINT "PK_5f60df667bdf0c5ad9a21399cc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "FK_419a45eddca88ebb6255b21e7b7" FOREIGN KEY ("parentReceiverId") REFERENCES "parents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "FK_9800d2ba37f05833a05f8653907" FOREIGN KEY ("childAuthorId") REFERENCES "children"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "FK_201d245d6fea77b9433559ada88" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" ADD CONSTRAINT "FK_7e67a527fbd56b72ff2e0ab17c7" FOREIGN KEY ("awardId") REFERENCES "awards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "FK_7e67a527fbd56b72ff2e0ab17c7"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "FK_201d245d6fea77b9433559ada88"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "FK_9800d2ba37f05833a05f8653907"`);
        await queryRunner.query(`ALTER TABLE "notifications_for_parent" DROP CONSTRAINT "FK_419a45eddca88ebb6255b21e7b7"`);
        await queryRunner.query(`DROP TABLE "notifications_for_parent"`);
    }

}
