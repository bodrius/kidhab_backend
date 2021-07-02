import {MigrationInterface, QueryRunner} from "typeorm";

export class AddImageUrlToHabitsAndTasks1607961936339 implements MigrationInterface {
    name = 'AddImageUrlToHabitsAndTasks1607961936339'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "imagePath" TO "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "habits" RENAME COLUMN "imagePath" TO "imageUrl"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habits" RENAME COLUMN "imageUrl" TO "imagePath"`);
        await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "imageUrl" TO "imagePath"`);
    }

}
