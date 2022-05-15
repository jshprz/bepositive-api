import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity({name: "posts_hashtags"})
export class PostsHashtags extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column('uuid', {nullable: false})
    post_id?: string;

    @Column('uuid', {nullable: false})
    hashtag_id?: string;

    @CreateDateColumn({type: 'timestamptz'})
    created_at?: Date;

    @UpdateDateColumn({type: 'timestamptz', nullable: true})
    updated_at?: Date;

    @DeleteDateColumn({type: 'timestamptz', nullable: true})
    deleted_at?: Date;

}