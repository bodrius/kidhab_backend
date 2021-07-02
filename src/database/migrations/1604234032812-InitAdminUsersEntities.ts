import {MigrationInterface, QueryRunner} from "typeorm";

export class InitAdminUsersEntities1604234032812 implements MigrationInterface {
    name = 'InitAdminUsersEntities1604234032812'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "permissions" jsonb NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_091baca34754e848b9f8c4e7be9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admin_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "username" character varying NOT NULL, "passwordHash" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "roleId" uuid, CONSTRAINT "PK_06744d221bb6145dc61e5dc441d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "adminUserId" uuid`);
        await queryRunner.query(`ALTER TABLE "admin_users" ADD CONSTRAINT "FK_74bf36024de2f5c8ffcf3cfc1e1" FOREIGN KEY ("roleId") REFERENCES "admin_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_15d75c4fa9eefadfc791f559b0d" FOREIGN KEY ("adminUserId") REFERENCES "admin_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_15d75c4fa9eefadfc791f559b0d"`);
        await queryRunner.query(`ALTER TABLE "admin_users" DROP CONSTRAINT "FK_74bf36024de2f5c8ffcf3cfc1e1"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "adminUserId"`);
        await queryRunner.query(`DROP TABLE "admin_users"`);
        await queryRunner.query(`DROP TABLE "admin_roles"`);
    }

}
