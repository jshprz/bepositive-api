import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity({name: "posts"})
export class Posts extends BaseEntity {

  @PrimaryGeneratedColumn({type: "int", unsigned: true})
  id?: number;

  @Column({type: "varchar", length: 255, nullable: false})
  user_id?: string;

  @Column({type: "text", nullable: true})
  caption?: string;

  @Column({type: "varchar", length: 50, nullable: false})
  status?: string;

  @Column({type: "bigint", nullable: false})
  view_count?: number;

  @Column({type: "varchar", nullable: true})
  google_maps_place_id?: string;

  @Column({type: "varchar", nullable: true, default: ""})
  location_details?: string;

  @Column("jsonb", {array: false, nullable: false})
  s3_files?: { key: string, type: string }[];

  @CreateDateColumn()
  created_at?: number;

  @UpdateDateColumn()
  updated_at?: number;

  @DeleteDateColumn()
  deleted_at?: number;
}