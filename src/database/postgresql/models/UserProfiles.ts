import {
    BaseEntity,
    BeforeInsert,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity({name: 'user_profiles'})
export class UserProfiles extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({type: "varchar", length: 255, nullable: false, unique: true})
    user_id?: string

    @Column({type: "varchar", length: 255, nullable: false, unique: true})
    email?: string

    @Column({type: "varchar", length: 50, nullable: false})
    name?: string

    @Column({type: "text", nullable: true})
    avatar?: string

    @Column({type: "varchar", length: 6, nullable: true})
    gender?: string

    @Column({type: "varchar", length: 100, nullable: true})
    profile_title?: string

    @Column({type: "text", nullable: true})
    profile_description?: string

    @Column({type: "date", nullable: true})
    date_of_birth?: string

    @Column({type: "text", nullable: true})
    website?: string

    @Column({type: "varchar", length: 50, nullable: true})
    city?: string

    @Column({type: "varchar", length: 50, nullable: true})
    state?: string

    @Column({type: "varchar", length: 50, nullable: true})
    zipcode?: string

    @Column({type: "varchar", length: 50, nullable: true})
    country?: string

    @Column({type: "varchar", length: 50, nullable: true})
    phone_number?: string

    @Column({type: "boolean", default: true})
    is_public?: boolean

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