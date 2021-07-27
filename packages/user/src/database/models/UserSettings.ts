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

  @Column({type: "timestamptz", nullable: false})
  created_at?: Date;

  @Column({type: "timestamptz", nullable: true})
  updated_at?: Date;

  @Column({type: "timestamptz", nullable: true})
  deleted_at?: Date;
}