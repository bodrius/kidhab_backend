import {MigrationInterface, QueryRunner} from "typeorm";

export class AddImageUrlsToHabitTemplatesAndHabitCategories1607797638585 implements MigrationInterface {
    name = 'AddImageUrlsToHabitTemplatesAndHabitCategories1607797638585'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habit-templates" RENAME COLUMN "imagePath" TO "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "habit_categories" ADD "imageUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habit_categories" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "habit-templates" RENAME COLUMN "imageUrl" TO "imagePath"`);
    }

}
