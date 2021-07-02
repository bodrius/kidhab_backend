import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCascadesForChildAndParentRemoval1604261286316 implements MigrationInterface {
    name = 'AddCascadesForChildAndParentRemoval1604261286316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_72527f399abce0550bb6e7963da"`);
        await queryRunner.query(`ALTER TABLE "habits" DROP CONSTRAINT "FK_fa63faddd522546fd6cf8f6d095"`);
        await queryRunner.query(`ALTER TABLE "awards" DROP CONSTRAINT "FK_0147164fb9d3a632661b63897d8"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_afbbabbd7daf5b91de4dca84de8"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_b6d4667a0df16f4d8f67593f215"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_72527f399abce0550bb6e7963da" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "habits" ADD CONSTRAINT "FK_fa63faddd522546fd6cf8f6d095" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "awards" ADD CONSTRAINT "FK_0147164fb9d3a632661b63897d8" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_afbbabbd7daf5b91de4dca84de8" FOREIGN KEY ("parentId") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_b6d4667a0df16f4d8f67593f215" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_b6d4667a0df16f4d8f67593f215"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_afbbabbd7daf5b91de4dca84de8"`);
        await queryRunner.query(`ALTER TABLE "awards" DROP CONSTRAINT "FK_0147164fb9d3a632661b63897d8"`);
        await queryRunner.query(`ALTER TABLE "habits" DROP CONSTRAINT "FK_fa63faddd522546fd6cf8f6d095"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_72527f399abce0550bb6e7963da"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_b6d4667a0df16f4d8f67593f215" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_afbbabbd7daf5b91de4dca84de8" FOREIGN KEY ("parentId") REFERENCES "parents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "awards" ADD CONSTRAINT "FK_0147164fb9d3a632661b63897d8" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "habits" ADD CONSTRAINT "FK_fa63faddd522546fd6cf8f6d095" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_72527f399abce0550bb6e7963da" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
