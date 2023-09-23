import { Column, Entity,  ManyToOne, OneToOne } from "typeorm";
import BaseEntity from "../base/base.entity";
import Role from "../role/role.entity";
import { AutoMap } from "@automapper/classes";
import Department from "../department/department.entity";
import AuthCode from "../auth/authcode.entity";

@Entity()
export default class User extends BaseEntity {

    @AutoMap()
    @Column('varchar', { name: 'username', nullable: false, unique: true })
    public username: string;

    @AutoMap()
    @Column('varchar', { name: 'password', nullable: false })
    public password: string;

    @AutoMap()
    @Column('varchar', { name: 'fullName', nullable: false })
    public fullName: string;

    @AutoMap()
    @Column('date', { name: 'dob', nullable: false })
    public dob: Date;

    @AutoMap()
    @Column('char', { name: 'idNumber', nullable: false, length: 12, unique: true })
    public idNumber: string;

    @AutoMap()
    @Column('boolean', { name: 'gender', nullable: false })
    public gender: boolean;

    @AutoMap()
    @Column('varchar', { name: 'address', nullable: false })
    public address: string;

    @AutoMap()
    @Column('char', { name: 'phoneNumber', nullable: false, length: 15, unique: true })
    public phoneNumber: string;

    @AutoMap()
    @Column('varchar', { name: 'email', nullable: false, unique: true })
    public email: string;

    @AutoMap()
    @Column('varchar', { name: 'avatarUrl', nullable: true, default: 'https://i.imgur.com/6VBx3io.png' })
    public avatarUrl: string;

    @AutoMap()
    @Column('boolean', { name: 'status', nullable: false, default: true })
    public status: boolean;

    @AutoMap()
    @Column('varchar', { name: 'refreshToken', nullable: true })
    public refreshToken: string;

    @AutoMap()
    @ManyToOne(() => Role, (role) => role.users, { onDelete: 'CASCADE' })
    public role: Role;

    @AutoMap()
    @ManyToOne(() => Department, (department) => department.users, { onDelete: 'CASCADE' })
    public department: Department;
    
    @AutoMap({ typeFn: () => AuthCode })
    @OneToOne(() => AuthCode, (authcode) => authcode.user, { onDelete: 'CASCADE' })
    public authcode: AuthCode;
}