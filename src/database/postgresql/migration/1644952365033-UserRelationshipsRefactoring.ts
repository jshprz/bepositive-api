import {MigrationInterface, QueryRunner} from "typeorm";

export class UserRelationshipsRefactoring1644952365033 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_relationships" RENAME COLUMN "user_id" TO "followee_id"`);
        await queryRunner.query(`ALTER TABLE "user_relationships" RENAME COLUMN "following_id" TO "follower_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_relationships" RENAME COLUMN "followee_id" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "user_relationships" RENAME COLUMN "follower_id" TO "following_id"`);
    }

}