import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "accesstokens"})
export class AccessTokens {
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