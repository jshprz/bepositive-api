import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";
import { Geometry } from "geojson";

@Entity({name: "posts"})
export class Posts extends BaseEntity {

  @PrimaryGeneratedColumn({type: "int", unsigned: true})
  id?: number;

  @Column({type: "varchar", length: 255, nullable: false})
  user_cognito_sub?: string;

  @Column({type: "text", nullable: true})
  caption?: string;

  @Column({type: "varchar", length: 50, nullable: false})
  status?: string;

  @Column({type: "bigint", nullable: false})
  view_count?: number;

  @Column({type: "point", nullable: true})
  lat_long?: Geometry;

  @Column("jsonb", {array: false, nullable: false})
  s3_files?: { key: string, type: string }[];

  @Column({type: "bigint", nullable: false})
  created_at?: number;

  @Column({type: "bigint", nullable: true})
  updated_at?: number;

  @Column({type: "bigint", nullable: true})
  deleted_at?: number;
}