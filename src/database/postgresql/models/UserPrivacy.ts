import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity({name: "user_privacy"})
export class UserPrivacy extends BaseEntity {

  @PrimaryGeneratedColumn({type: "int", unsigned: true})
  id?: number;

  @Column({type: "varchar", length: 255, nullable: false})
  user_id?: string;

  @Column({type: "varchar", length: 50, nullable: false})
  status?: string;

  @CreateDateColumn()
  created_at?: number;

  @UpdateDateColumn({nullable: true})
  updated_at?: number;

  @DeleteDateColumn({nullable: true})
  deleted_at?: number;
}