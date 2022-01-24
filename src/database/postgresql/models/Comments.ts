import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "comments"})
export class Comments extends BaseEntity {

  @PrimaryGeneratedColumn({type: "int", unsigned: true})
  id?: number;

  @Column({type: "varchar", length: 255, nullable: false})
  user_id?: string;

  @Column({type: "int", unsigned: true, nullable: false})
  post_id?: number;

  @Column({type: "text", nullable: true})
  content?: string;

  @Column({type: "varchar", length: 50, nullable: false})
  status?: string;

  @Column({type: "bigint", nullable: false})
  created_at?: number;

  @Column({type: "bigint", nullable: true})
  updated_at?: number;

  @Column({type: "bigint", nullable: true})
  deleted_at?: number;
}