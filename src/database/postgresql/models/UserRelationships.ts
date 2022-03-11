import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn
} from "typeorm";

@Entity({name: "user_relationships"})
export class UserRelationships extends BaseEntity {

  @PrimaryGeneratedColumn({type: "int", unsigned: true})
  id?: number;

  @Column({type: "varchar", length: 255, nullable: false})
  followee_id?: string;

  @Column({type: "varchar", length: 255, nullable: false})
  follower_id?: string;

  @CreateDateColumn({type: 'timestamptz'})
  created_at?: Date;

  @UpdateDateColumn({type: 'timestamptz', nullable: true})
  updated_at?: Date;

  @DeleteDateColumn({type: 'timestamptz', nullable: true})
  deleted_at?: Date;
}