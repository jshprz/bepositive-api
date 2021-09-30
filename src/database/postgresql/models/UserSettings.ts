import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./Users";

@Entity({name: "user_settings"})
export class UserSettings {

  @PrimaryGeneratedColumn({type: "int", unsigned: true})
  id?: number

  @ManyToOne(type => Users)
  @JoinColumn()
  @Column({type: "int", nullable: false, unsigned: true})
  user?: Users;

  @Column({type: "varchar", length: 50, nullable: false, unique: true})
  options?: string;

  @Column({type: "text", nullable: false})
  value?: string;

  @Column({type: "bigint", nullable: false})
  created_at?: number;

  @Column({type: "bigint", nullable: true})
  updated_at?: number;

  @Column({type: "bigint", nullable: true})
  deleted_at?: number;
}