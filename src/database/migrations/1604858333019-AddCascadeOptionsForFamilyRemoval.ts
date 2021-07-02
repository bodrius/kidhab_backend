import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCascadeOptionsForFamilyRemoval1604858333019 implements MigrationInterface {
    name = 'AddCascadeOptionsForFamilyRemoval1604858333019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parents" DROP CONSTRAINT "FK_f0e429716b168d5255f8aaa3745"`);
        await queryRunner.query(`ALTER TABLE "habit-templates" DROP CONSTRAINT "FK_46ea4ab724368b15ed2253c3420"`);
        await queryRunner.query(`ALTER TABLE "children" DROP CONSTRAINT "FK_60470a6ffee687392d8c64c31a9"`);
        await queryRunner.query(`ALTER TABLE "award_templates" DROP CONSTRAINT "FK_43ff8ffcb3e9199f205bd961bfb"`);
        await queryRunner.query(`ALTER TABLE "parents" ADD CONSTRAINT "FK_f0e429716b168d5255f8aaa3745" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "habit-templates" ADD CONSTRAINT "FK_46ea4ab724368b15ed2253c3420" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "children" ADD CONSTRAINT "FK_60470a6ffee687392d8c64c31a9" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "award_templates" ADD CONSTRAINT "FK_43ff8ffcb3e9199f205bd961bfb" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "award_templates" DROP CONSTRAINT "FK_43ff8ffcb3e9199f205bd961bfb"`);
        await queryRunner.query(`ALTER TABLE "children" DROP CONSTRAINT "FK_60470a6ffee687392d8c64c31a9"`);
        await queryRunner.query(`ALTER TABLE "habit-templates" DROP CONSTRAINT "FK_46ea4ab724368b15ed2253c3420"`);
        await queryRunner.query(`ALTER TABLE "parents" DROP CONSTRAINT "FK_f0e429716b168d5255f8aaa3745"`);
        await queryRunner.query(`ALTER TABLE "award_templates" ADD CONSTRAINT "FK_43ff8ffcb3e9199f205bd961bfb" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "children" ADD CONSTRAINT "FK_60470a6ffee687392d8c64c31a9" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "habit-templates" ADD CONSTRAINT "FK_46ea4ab724368b15ed2253c3420" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parents" ADD CONSTRAINT "FK_f0e429716b168d5255f8aaa3745" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
