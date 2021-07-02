import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLevelStreakBrokenFlag1613315879201
  implements MigrationInterface {
  name = 'AddLevelStreakBrokenFlag1613315879201';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "habits" ADD "levelStreakBroken" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "habits" DROP COLUMN "levelStreakBroken"`,
    );
  }
}
