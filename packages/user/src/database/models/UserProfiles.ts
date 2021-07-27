import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./Users";

@Entity({name: "user_profiles"})
export class UserProfiles {

  @PrimaryGeneratedColumn({type: "int", unsigned: true})
  id?: number

  @ManyToOne(type => Users)
  @JoinColumn()
  @Column({type: "int", nullable: false, unsigned: true})
  user?: Users;

  @Column({type: "varchar", length: 50, nullable: false})
  first_name?: string;

  @Column({type: "varchar", length: 50, nullable: false})
  last_name?: string;

  @Column({type: "varchar", length: 255, nullable: false})
  avatar_key?: string;

  @Column({type: "char", length: 6, nullable: false})
  gender?: string;

  @Column({type: "varchar", length: 50, nullable: true})
  profile_description?: string;

  @Column({type: "date", nullable: false})
  dob?: string;

  @Column({type: "varchar", length: 255, nullable: true})
  about?: string;

  @Column({type: "varchar", length: 255, nullable: true})
  website?: string;

  @Column({type: "char", length: 50, nullable: true})
  city?: string;

  @Column({type: "char", length: 50, nullable: true})
  state?: string;

  @Column({type: "varchar", length: 50, nullable: true})
  zipcode?: string;

  @Column({type: "char", length: 50, nullable: true})
  country?: string;

  @Column({type: "varchar", length: 50, nullable: true})
  contact_detail?: string;

  @Column({type: "char", length: 10, nullable: false})
  status?: string;

  @Column({type: "timestamptz", nullable: false})
  created_at?: Date;

  @Column({type: "timestamptz", nullable: true})
  updated_at?: Date;

  @Column({type: "timestamptz", nullable: true})
  deleted_at?: Date;
}