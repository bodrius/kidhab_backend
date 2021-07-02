import {MigrationInterface, QueryRunner} from "typeorm";

export class AddHabitLevelsFields1601463496224 implements MigrationInterface {
    name = 'AddHabitLevelsFields1601463496224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habits" ADD "timesToCompleteLevel" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "habits" ADD "timesToCompleteLevelLeft" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "habits" ADD "habitLevel" integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habits" DROP COLUMN "habitLevel"`);
        await queryRunner.query(`ALTER TABLE "habits" DROP COLUMN "timesToCompleteLevelLeft"`);
        await queryRunner.query(`ALTER TABLE "habits" DROP COLUMN "timesToCompleteLevel"`);
    }

}
