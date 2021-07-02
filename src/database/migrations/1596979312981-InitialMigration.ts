import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1596979312981 implements MigrationInterface {
  name = 'InitialMigration1596979312981';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "award_templates" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "description" character varying NOT NULL,
            "type" character varying NOT NULL DEFAULT 'MATERIAL',
            "cost" integer NOT NULL, "imageUrl" character varying,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_d4ee587e295161baafd795db67a" PRIMARY KEY ("id")
        )`);
    await queryRunner.query(`
        CREATE TABLE "parents" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "email" character varying NOT NULL,
            "accountType" character varying NOT NULL DEFAULT 'BASIC',
            "isTestPassed" boolean NOT NULL DEFAULT false,
            "username" character varying,
            "passwordHash" character varying,
            "avatarPath" character varying,
            "country" character varying,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "familyId" uuid,
            CONSTRAINT "UQ_07b4151ae2a983823d922d5cf03" UNIQUE ("email"),
            CONSTRAINT "PK_9a4dc67c7b8e6a9cb918938d353" PRIMARY KEY ("id")
        )`);
    await queryRunner.query(`
        CREATE TABLE "families" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying,
            "parentInviteHash" character varying,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_70414ac0c8f45664cf71324b9bb" PRIMARY KEY ("id")
        )`);
    await queryRunner.query(`
        CREATE TABLE "habit-templates" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "points" integer NOT NULL,
            "description" character varying NOT NULL,
            "imagePath" character varying,
            "defaultReccurence" interval NOT NULL,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "categoryId" uuid,
            CONSTRAINT "PK_7fb40900f126d3e4e9e5ab59c4c" PRIMARY KEY ("id")
        )`);
    await queryRunner.query(`
        CREATE TABLE "habit_categories" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_f3d7058e0fc0624b504ff4e5459" PRIMARY KEY ("id")
        )`);
    await queryRunner.query(`
        CREATE TABLE "tasks" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "description" character varying NOT NULL,
            "totalPoints" integer,
            "status" character varying NOT NULL DEFAULT 'CREATED',
            "date" date NOT NULL,
            "imagePath" character varying,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "habitId" uuid,
            "childId" uuid,
            CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")
        )`);
    await queryRunner.query(`
        CREATE TABLE "habits" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "description" character varying NOT NULL,
            "points" integer NOT NULL,
            "pointsRate" integer NOT NULL,
            "status" character varying NOT NULL DEFAULT 'IN_PROGRESS',
            "imagePath" character varying,
            "reccurence" interval NOT NULL,
            "baseDate" date NOT NULL,
            "timesToComplete" integer,
            "timesToCompleteLeft" integer,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "categoryId" uuid,
            "childId" uuid,
            CONSTRAINT "PK_b3ec33c2d7af69d09fcf4af7e39" PRIMARY KEY ("id")
        )`);
    await queryRunner.query(`
        CREATE TABLE "children" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "username" character varying NOT NULL,
            "age" smallint NOT NULL,
            "gender" character varying NOT NULL,
            "status" character varying DEFAULT 'CREATED',
            "inviteHash" character varying,
            "email" character varying,
            "passwordHash" character varying,
            "avatarPath" character varying,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "familyId" uuid,
            CONSTRAINT "UQ_60b2c86fe18899d74f1bc19de25" UNIQUE ("inviteHash"),
            CONSTRAINT "PK_8c5a7cbebf2c702830ef38d22b0" PRIMARY KEY ("id")
        )`);
    await queryRunner.query(`
        CREATE TABLE "awards" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "description" character varying NOT NULL,
            "type" character varying NOT NULL DEFAULT 'MATERIAL',
            "cost" integer NOT NULL,
            "imageUrl" character varying,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "childId" uuid,
            CONSTRAINT "PK_bc3f6adc548ff46c76c03e06377" PRIMARY KEY ("id")
        )`);
    await queryRunner.query(`
        CREATE TABLE "sessions" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "status" character varying NOT NULL DEFAULT 'ACTIVE',
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "parentId" uuid,
            "childId" uuid,
            CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id")
        )`);
    await queryRunner.query(
      `ALTER TABLE "parents" ADD CONSTRAINT "FK_f0e429716b168d5255f8aaa3745" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "habit-templates" ADD CONSTRAINT "FK_9bfb84db23a775d580474e312d1" FOREIGN KEY ("categoryId") REFERENCES "habit_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_4145ca2ee7562d554bb73ee09b3" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_72527f399abce0550bb6e7963da" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "habits" ADD CONSTRAINT "FK_6c6aa72a781a037f1b31fe078e1" FOREIGN KEY ("categoryId") REFERENCES "habit_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "habits" ADD CONSTRAINT "FK_fa63faddd522546fd6cf8f6d095" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "children" ADD CONSTRAINT "FK_60470a6ffee687392d8c64c31a9" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "awards" ADD CONSTRAINT "FK_0147164fb9d3a632661b63897d8" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_afbbabbd7daf5b91de4dca84de8" FOREIGN KEY ("parentId") REFERENCES "parents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_b6d4667a0df16f4d8f67593f215" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_b6d4667a0df16f4d8f67593f215"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_afbbabbd7daf5b91de4dca84de8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "awards" DROP CONSTRAINT "FK_0147164fb9d3a632661b63897d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "children" DROP CONSTRAINT "FK_60470a6ffee687392d8c64c31a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "habits" DROP CONSTRAINT "FK_fa63faddd522546fd6cf8f6d095"`,
    );
    await queryRunner.query(
      `ALTER TABLE "habits" DROP CONSTRAINT "FK_6c6aa72a781a037f1b31fe078e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_72527f399abce0550bb6e7963da"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_4145ca2ee7562d554bb73ee09b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "habit-templates" DROP CONSTRAINT "FK_9bfb84db23a775d580474e312d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "parents" DROP CONSTRAINT "FK_f0e429716b168d5255f8aaa3745"`,
    );
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "awards"`);
    await queryRunner.query(`DROP TABLE "children"`);
    await queryRunner.query(`DROP TABLE "habits"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TABLE "habit_categories"`);
    await queryRunner.query(`DROP TABLE "habit-templates"`);
    await queryRunner.query(`DROP TABLE "families"`);
    await queryRunner.query(`DROP TABLE "parents"`);
    await queryRunner.query(`DROP TABLE "award_templates"`);
  }
}
