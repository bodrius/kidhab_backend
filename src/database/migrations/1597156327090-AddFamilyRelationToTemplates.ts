import {MigrationInterface, QueryRunner} from "typeorm";

export class AddFamilyRelationToTemplates1597156327090 implements MigrationInterface {
    name = 'AddFamilyRelationToTemplates1597156327090'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habit-templates" ADD "familyId" uuid`);
        await queryRunner.query(`ALTER TABLE "award_templates" ADD "familyId" uuid`);
        await queryRunner.query(`ALTER TABLE "habit-templates" ADD CONSTRAINT "FK_46ea4ab724368b15ed2253c3420" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "award_templates" ADD CONSTRAINT "FK_43ff8ffcb3e9199f205bd961bfb" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "award_templates" DROP CONSTRAINT "FK_43ff8ffcb3e9199f205bd961bfb"`);
        await queryRunner.query(`ALTER TABLE "habit-templates" DROP CONSTRAINT "FK_46ea4ab724368b15ed2253c3420"`);
        await queryRunner.query(`ALTER TABLE "award_templates" DROP COLUMN "familyId"`);
        await queryRunner.query(`ALTER TABLE "habit-templates" DROP COLUMN "familyId"`);
    }

}
