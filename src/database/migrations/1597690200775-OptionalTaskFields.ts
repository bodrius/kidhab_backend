import {MigrationInterface, QueryRunner} from "typeorm";

export class OptionalTaskFields1597690200775 implements MigrationInterface {
    name = 'OptionalTaskFields1597690200775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "description" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "name" SET NOT NULL`);
    }

}
