import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAwardDrafts1597228622796 implements MigrationInterface {
    name = 'AddAwardDrafts1597228622796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "awards" ADD "draft" jsonb`);
        await queryRunner.query(`ALTER TABLE "awards" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "awards" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "awards" ALTER COLUMN "type" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "awards" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "awards" ALTER COLUMN "cost" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "awards" ALTER COLUMN "cost" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "awards" ALTER COLUMN "type" SET DEFAULT 'MATERIAL'`);
        await queryRunner.query(`ALTER TABLE "awards" ALTER COLUMN "type" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "awards" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "awards" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "awards" DROP COLUMN "draft"`);
    }

}
