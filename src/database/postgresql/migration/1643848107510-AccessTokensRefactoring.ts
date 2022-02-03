import {MigrationInterface, QueryRunner} from "typeorm";

export class AccessTokensRefactoring1643848107510 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "access_tokens" RENAME COLUMN "email" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "access_tokens" RENAME COLUMN "accessToken" TO "access_token"`);
        await queryRunner.query(`ALTER TABLE "access_tokens" ALTER COLUMN "user_id" TYPE VARCHAR(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "access_tokens" RENAME COLUMN "user_id" TO "email"`);
        await queryRunner.query(`ALTER TABLE "access_tokens" RENAME COLUMN "access_token" TO "accessToken"`);
        await queryRunner.query(`ALTER TABLE "access_tokens" ALTER COLUMN "email" TYPE VARCHAR(50)`);
    }

}
