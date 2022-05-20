import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    BeforeInsert
} from "typeorm";

@Entity({name: "hashtags"})
export class Hashtags extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({type: "varchar", length: 50, nullable: false, unique: true})
    name?: string;

    @CreateDateColumn({type: 'timestamptz'})
    created_at?: Date;

    @UpdateDateColumn({type: 'timestamptz', nullable: true})
    updated_at?: Date;

    @DeleteDateColumn({type: 'timestamptz', nullable: true})
    deleted_at?: Date;

    @BeforeInsert()
    updateDates() {
        this.created_at = new Date();
        this.updated_at = new Date();
    }
}