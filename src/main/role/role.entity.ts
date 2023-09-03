import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import User from "../user/user.entity";
import { AutoMap } from "@automapper/classes";

@Entity()
export default class Role {

    @PrimaryGeneratedColumn('increment')
    public id: number;

    @AutoMap()
    @Column('varchar', { name: 'roleName', nullable: false, length: 50, unique: true })
    public roleName: string;

    @AutoMap()
    @OneToMany(() => User, (user) => user.role, { onDelete: 'CASCADE' })
    public users: User[];
}