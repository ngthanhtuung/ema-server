import { Column, Entity, OneToMany } from "typeorm";
import User from "../user/user.entity";
import BaseEntity from "../base/base.entity";
import { AutoMap } from "@automapper/classes";

@Entity()
export default class Department extends BaseEntity {

    @AutoMap()
    @Column('varchar', { name: 'departmentName', length: 50, nullable: false, unique: true })
    public departmentName: string;

    @AutoMap()
    @Column('varchar', { name: 'description', nullable: true })
    public description: string;

    @AutoMap()
    @Column('boolean', { name: 'status', default: true })
    public status: boolean;

    @OneToMany(() => User, (user) => user.department, { onDelete: 'CASCADE' })
    public users: User[];

}