import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

@Entity({name: "access_tokens"})
export class AccessTokens extends BaseEntity {
  @PrimaryGeneratedColumn({type: "int", unsigned: true})
  id?: number;

  @Column({type: "text", nullable: false})
  accesstoken?: string;

  @Column({type: "varchar", length: 50, nullable: false})
  email?: string;

  @Column({type: "bigint", nullable: false})
  created_at?: number;

  @Column({type: "bigint", nullable: true})
  updated_at?: number;

  @Column({type: "bigint", nullable: true})
  deleted_at?: number;
}