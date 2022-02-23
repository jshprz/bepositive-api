import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

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

  @CreateDateColumn()
  created_at?: number;

  @UpdateDateColumn()
  updated_at?: number;

  @DeleteDateColumn()
  deleted_at?: number;
}