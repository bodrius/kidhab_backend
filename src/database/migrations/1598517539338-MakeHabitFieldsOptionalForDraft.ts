import {MigrationInterface, QueryRunner} from "typeorm";

export class MakeHabitFieldsOptionalForDraft1598517539338 implements MigrationInterface {
    name = 'MakeHabitFieldsOptionalForDraft1598517539338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habits" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "habits" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "habits" ALTER COLUMN "points" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "habits" ALTER COLUMN "pointsRate" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "habits" ALTER COLUMN "reccurence" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "habits" ALTER COLUMN "baseDate" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habits" ALTER COLUMN "baseDate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "habits" ALTER COLUMN "reccurence" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "habits" ALTER COLUMN "pointsRate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "habits" ALTER COLUMN "points" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "habits" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "habits" ALTER COLUMN "name" SET NOT NULL`);
    }

}
