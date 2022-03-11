import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn
} from "typeorm";

@Entity({name: "access_tokens"})
export class AccessTokens extends BaseEntity {
  @PrimaryGeneratedColumn({type: "int", unsigned: true})
  id?: number;

  @Column({type: "text", nullable: false})
  access_token?: string;

  @Column({type: "varchar", length: 255, nullable: false})
  user_id?: string;

  @CreateDateColumn({type: 'timestamptz'})
  created_at?: Date;

  @UpdateDateColumn({type: 'timestamptz', nullable: true})
  updated_at?: Date;

  @DeleteDateColumn({type: 'timestamptz', nullable: true})
  deleted_at?: Date;
}