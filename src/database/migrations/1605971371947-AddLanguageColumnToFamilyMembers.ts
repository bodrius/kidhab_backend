import {MigrationInterface, QueryRunner} from "typeorm";

export class AddLanguageColumnToFamilyMembers1605971371947 implements MigrationInterface {
    name = 'AddLanguageColumnToFamilyMembers1605971371947'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parents" ADD "language" character varying NOT NULL DEFAULT 'RU'`);
        await queryRunner.query(`ALTER TABLE "children" ADD "language" character varying NOT NULL DEFAULT 'RU'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children" DROP COLUMN "language"`);
        await queryRunner.query(`ALTER TABLE "parents" DROP COLUMN "language"`);
    }

}
