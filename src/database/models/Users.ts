import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";

@Entity({name: "users"})
export class Users extends BaseEntity {

  @PrimaryGeneratedColumn({type: "int", unsigned: true})
  id?: number;

  @Column({type: "varchar", length: 50, nullable: false, unique: true})
  email?: string;

  @Column({type: "varchar", length: 50, nullable: false})
  password?: string;

  @Column({type: "char", length: 10, nullable: false})
  account_status?: string;

  @Column({type: "date", nullable: true})
  verified_at?: string;

  @Column({type: "timestamptz", nullable: false})
  created_at?: Date;

  @Column({type: "timestamptz", nullable: true})
  updated_at?: Date;

  @Column({type: "timestamptz", nullable: true})
  deleted_at?: Date;
}