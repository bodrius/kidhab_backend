import {MigrationInterface, QueryRunner} from "typeorm";

export class AddSeedsTable1597582138618 implements MigrationInterface {
    name = 'AddSeedsTable1597582138618'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "seeds" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "json" jsonb NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3ac799e4ece18bc838823bb6a4b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "habit-templates" DROP CONSTRAINT "FK_9bfb84db23a775d580474e312d1"`);
        await queryRunner.query(`ALTER TABLE "habit-templates" ALTER COLUMN "categoryId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "habit-templates" ADD CONSTRAINT "FK_9bfb84db23a775d580474e312d1" FOREIGN KEY ("categoryId") REFERENCES "habit_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "habit-templates" DROP CONSTRAINT "FK_9bfb84db23a775d580474e312d1"`);
        await queryRunner.query(`ALTER TABLE "habit-templates" ALTER COLUMN "categoryId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "habit-templates" ADD CONSTRAINT "FK_9bfb84db23a775d580474e312d1" FOREIGN KEY ("categoryId") REFERENCES "habit_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE "seeds"`);
    }

}
