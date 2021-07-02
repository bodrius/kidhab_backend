import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCategoriesAndTemplatesTranslations1606659897467 implements MigrationInterface {
    name = 'AddCategoriesAndTemplatesTranslations1606659897467'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habit-templates" ADD "translations" jsonb NOT NULL DEFAULT '{}'::json`);
        await queryRunner.query(`ALTER TABLE "habit_categories" ADD "translations" jsonb NOT NULL DEFAULT '{}'::json`);
        await queryRunner.query(`ALTER TABLE "award_templates" ADD "translations" jsonb NOT NULL DEFAULT '{}'::json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "award_templates" DROP COLUMN "translations"`);
        await queryRunner.query(`ALTER TABLE "habit_categories" DROP COLUMN "translations"`);
        await queryRunner.query(`ALTER TABLE "habit-templates" DROP COLUMN "translations"`);
    }

}
