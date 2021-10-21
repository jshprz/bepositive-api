import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "user_relationships"})
export class UserRelationships extends BaseEntity {

  @PrimaryGeneratedColumn({type: "int", unsigned: true})
  id?: number;

  @Column({type: "varchar", length: 255, nullable: false})
  user_id?: string;

  @Column({type: "varchar", length: 255, nullable: false})
  following_id?: string;

  @Column({type: "bigint", nullable: false})
  created_at?: number;

  @Column({type: "bigint", nullable: true})
  updated_at?: number;

  @Column({type: "bigint", nullable: true})
  deleted_at?: number;
}