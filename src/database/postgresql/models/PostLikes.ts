import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from "typeorm";

@Entity({name: "post_likes"})
export class PostLikes extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('uuid', {nullable: false})
  post_id?: string;

  @Column({type: "varchar", length: 255, nullable: false})
  user_id?: string;

  @CreateDateColumn({type: 'timestamptz'})
  created_at?: Date;

  @UpdateDateColumn({type: 'timestamptz', nullable: true})
  updated_at?: Date;

  @DeleteDateColumn({type: 'timestamptz', nullable: true})
  deleted_at?: Date;

}