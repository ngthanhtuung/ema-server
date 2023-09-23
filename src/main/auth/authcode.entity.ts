import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AutoMap } from "@automapper/classes";
import User from "../user/user.entity";

@Entity()
export default class AuthCode {

    @AutoMap()
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    public id: string;

    @AutoMap()
    @Column('varchar', { name: 'username', nullable: false, unique: true })
    public authcode: string;

    @AutoMap()
    @Column('varchar', { name: 'createdAt' })
    public createdAt: string;

    @AutoMap({ typeFn: () => User })
    @OneToOne(() => User, (user) => user.authcode, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    public user: User;
}