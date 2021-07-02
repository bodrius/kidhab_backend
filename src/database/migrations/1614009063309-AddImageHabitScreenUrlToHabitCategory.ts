import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageHabitScreenUrlToHabitCategory1614009063309
  implements MigrationInterface {
  name = 'AddImageHabitScreenUrlToHabitCategory1614009063309';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "habit_categories" ADD "imageHabitScreenUrl" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "habit_categories" DROP COLUMN "imageHabitScreenUrl"`,
    );
  }
}
