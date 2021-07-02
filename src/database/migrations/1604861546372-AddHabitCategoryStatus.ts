import {MigrationInterface, QueryRunner} from "typeorm";

export class AddHabitCategoryStatus1604861546372 implements MigrationInterface {
    name = 'AddHabitCategoryStatus1604861546372'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habit_categories" ADD "status" character varying NOT NULL DEFAULT 'ACTIVE'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habit_categories" DROP COLUMN "status"`);
    }

}
