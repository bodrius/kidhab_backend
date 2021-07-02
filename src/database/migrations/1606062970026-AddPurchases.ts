import {MigrationInterface, QueryRunner} from "typeorm";

export class AddPurchases1606062970026 implements MigrationInterface {
    name = 'AddPurchases1606062970026'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transactionId" character varying NOT NULL, "subscriptionId" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "purchasedAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "familyId" uuid, "parentId" uuid, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "families" ADD "subscriptionId" character varying`);
        await queryRunner.query(`ALTER TABLE "families" ADD "subscriptionExpiresAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "parents" ALTER COLUMN "language" SET DEFAULT 'RU'`);
        await queryRunner.query(`ALTER TABLE "children" ALTER COLUMN "language" SET DEFAULT 'RU'`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_6f2c329ef7b839cbdae96dcbd9c" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_7db85350c23441a789eee0a5986" FOREIGN KEY ("parentId") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_7db85350c23441a789eee0a5986"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_6f2c329ef7b839cbdae96dcbd9c"`);
        await queryRunner.query(`ALTER TABLE "children" ALTER COLUMN "language" SET DEFAULT 'EN'`);
        await queryRunner.query(`ALTER TABLE "parents" ALTER COLUMN "language" SET DEFAULT 'EN'`);
        await queryRunner.query(`ALTER TABLE "families" DROP COLUMN "subscriptionExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "families" DROP COLUMN "subscriptionId"`);
        await queryRunner.query(`DROP TABLE "payments"`);
    }

}
