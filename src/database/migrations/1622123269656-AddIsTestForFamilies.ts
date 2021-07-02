import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIsTestForFamilies1622123269656 implements MigrationInterface {
    name = 'AddIsTestForFamilies1622123269656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "families" ADD "isTest" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`COMMENT ON COLUMN "habit-templates"."translations" IS NULL`);
        await queryRunner.query(`ALTER TABLE "habit-templates" ALTER COLUMN "translations" SET DEFAULT '{}'::json`);
        await queryRunner.query(`COMMENT ON COLUMN "habit_categories"."translations" IS NULL`);
        await queryRunner.query(`ALTER TABLE "habit_categories" ALTER COLUMN "translations" SET DEFAULT '{}'::json`);
        await queryRunner.query(`COMMENT ON COLUMN "habits"."translations" IS NULL`);
        await queryRunner.query(`ALTER TABLE "habits" ALTER COLUMN "translations" SET DEFAULT '{}'::json`);
        await queryRunner.query(`COMMENT ON COLUMN "awards"."translations" IS NULL`);
        await queryRunner.query(`ALTER TABLE "awards" ALTER COLUMN "translations" SET DEFAULT '{}'::json`);
        await queryRunner.query(`COMMENT ON COLUMN "award_templates"."translations" IS NULL`);
        await queryRunner.query(`ALTER TABLE "award_templates" ALTER COLUMN "translations" SET DEFAULT '{}'::json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "award_templates" ALTER COLUMN "translations" SET DEFAULT '{}'`);
        await queryRunner.query(`COMMENT ON COLUMN "award_templates"."translations" IS NULL`);
        await queryRunner.query(`ALTER TABLE "awards" ALTER COLUMN "translations" SET DEFAULT '{}'`);
        await queryRunner.query(`COMMENT ON COLUMN "awards"."translations" IS NULL`);
        await queryRunner.query(`ALTER TABLE "habits" ALTER COLUMN "translations" SET DEFAULT '{}'`);
        await queryRunner.query(`COMMENT ON COLUMN "habits"."translations" IS NULL`);
        await queryRunner.query(`ALTER TABLE "habit_categories" ALTER COLUMN "translations" SET DEFAULT '{}'`);
        await queryRunner.query(`COMMENT ON COLUMN "habit_categories"."translations" IS NULL`);
        await queryRunner.query(`ALTER TABLE "habit-templates" ALTER COLUMN "translations" SET DEFAULT '{}'`);
        await queryRunner.query(`COMMENT ON COLUMN "habit-templates"."translations" IS NULL`);
        await queryRunner.query(`ALTER TABLE "families" DROP COLUMN "isTest"`);
    }

}
