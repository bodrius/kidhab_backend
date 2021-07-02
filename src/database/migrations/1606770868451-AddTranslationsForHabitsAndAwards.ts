import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTranslationsForHabitsAndAwards1606770868451 implements MigrationInterface {
    name = 'AddTranslationsForHabitsAndAwards1606770868451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habits" ADD "translations" jsonb NOT NULL DEFAULT '{}'::json`);
        await queryRunner.query(`ALTER TABLE "awards" ADD "translations" jsonb NOT NULL DEFAULT '{}'::json`);
        await queryRunner.query(`COMMENT ON COLUMN "habit-templates"."translations" IS NULL`);
        await queryRunner.query(`ALTER TABLE "habit-templates" ALTER COLUMN "translations" SET DEFAULT '{}'::json`);
        await queryRunner.query(`COMMENT ON COLUMN "habit_categories"."translations" IS NULL`);
        await queryRunner.query(`ALTER TABLE "habit_categories" ALTER COLUMN "translations" SET DEFAULT '{}'::json`);
        await queryRunner.query(`COMMENT ON COLUMN "award_templates"."translations" IS NULL`);
        await queryRunner.query(`ALTER TABLE "award_templates" ALTER COLUMN "translations" SET DEFAULT '{}'::json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "award_templates" ALTER COLUMN "translations" SET DEFAULT '{}'`);
        await queryRunner.query(`COMMENT ON COLUMN "award_templates"."translations" IS NULL`);
        await queryRunner.query(`ALTER TABLE "habit_categories" ALTER COLUMN "translations" SET DEFAULT '{}'`);
        await queryRunner.query(`COMMENT ON COLUMN "habit_categories"."translations" IS NULL`);
        await queryRunner.query(`ALTER TABLE "habit-templates" ALTER COLUMN "translations" SET DEFAULT '{}'`);
        await queryRunner.query(`COMMENT ON COLUMN "habit-templates"."translations" IS NULL`);
        await queryRunner.query(`ALTER TABLE "awards" DROP COLUMN "translations"`);
        await queryRunner.query(`ALTER TABLE "habits" DROP COLUMN "translations"`);
    }

}
