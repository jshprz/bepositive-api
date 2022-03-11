import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from "typeorm";

@Entity({name: "post_shares"})
export class PostShares extends BaseEntity {

  @PrimaryGeneratedColumn({type: "int", unsigned: true})
  id?: number;

  @Column({type: "int", unsigned: true, nullable: false})
  post_id?: number;

  @Column({type: "varchar", length: 255, nullable: false})
  user_id?: string;

  @Column({type: "text", nullable: true})
  share_caption?: string;

  @CreateDateColumn({type: 'timestamptz'})
  created_at?: Date;

  @UpdateDateColumn({type: 'timestamptz', nullable: true})
  updated_at?: Date;

  @DeleteDateColumn({type: 'timestamptz', nullable: true})
  deleted_at?: Date;
}