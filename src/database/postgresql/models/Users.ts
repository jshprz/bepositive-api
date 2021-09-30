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

  @Column({type: "bigint", nullable: true})
  verified_at?: number;

  @Column({type: 'varchar', nullable: true})
  resetToken?: string;

  @Column({type: 'bigint', nullable: true})
  resetTokenExpiration?: number;

  @Column({type: "bigint", nullable: false})
  created_at?: number;

  @Column({type: "bigint", nullable: true})
  updated_at?: number;

  @Column({type: "bigint", nullable: true})
  deleted_at?: number;
}