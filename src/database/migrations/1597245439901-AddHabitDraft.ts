import {MigrationInterface, QueryRunner} from "typeorm";

export class AddHabitDraft1597245439901 implements MigrationInterface {
    name = 'AddHabitDraft1597245439901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habits" ADD "draft" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habits" DROP COLUMN "draft"`);
    }

}
