import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCategoriesForChild1597645783070 implements MigrationInterface {
    name = 'AddCategoriesForChild1597645783070'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "children_categories_habit_categories" ("childrenId" uuid NOT NULL, "habitCategoriesId" uuid NOT NULL, CONSTRAINT "PK_ced6f2e9292ae80d5d25d8cef28" PRIMARY KEY ("childrenId", "habitCategoriesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a6946bea101e89dd86197caeb3" ON "children_categories_habit_categories" ("childrenId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dc27db0d1e946ab58331bc2ed6" ON "children_categories_habit_categories" ("habitCategoriesId") `);
        await queryRunner.query(`ALTER TABLE "children_categories_habit_categories" ADD CONSTRAINT "FK_a6946bea101e89dd86197caeb32" FOREIGN KEY ("childrenId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "children_categories_habit_categories" ADD CONSTRAINT "FK_dc27db0d1e946ab58331bc2ed66" FOREIGN KEY ("habitCategoriesId") REFERENCES "habit_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_categories_habit_categories" DROP CONSTRAINT "FK_dc27db0d1e946ab58331bc2ed66"`);
        await queryRunner.query(`ALTER TABLE "children_categories_habit_categories" DROP CONSTRAINT "FK_a6946bea101e89dd86197caeb32"`);
        await queryRunner.query(`DROP INDEX "IDX_dc27db0d1e946ab58331bc2ed6"`);
        await queryRunner.query(`DROP INDEX "IDX_a6946bea101e89dd86197caeb3"`);
        await queryRunner.query(`DROP TABLE "children_categories_habit_categories"`);
    }

}
