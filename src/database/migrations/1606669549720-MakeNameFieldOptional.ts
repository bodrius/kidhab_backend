import {MigrationInterface, QueryRunner} from "typeorm";

export class MakeNameFieldOptional1606669549720 implements MigrationInterface {
    name = 'MakeNameFieldOptional1606669549720'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habit-templates" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "habit_categories" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "award_templates" ALTER COLUMN "name" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "award_templates" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "habit_categories" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "habit-templates" ALTER COLUMN "name" SET NOT NULL`);
    }

}
