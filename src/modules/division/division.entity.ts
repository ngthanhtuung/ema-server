import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../base/base.entity";
import { UserEntity } from "../user/user.entity";

@Entity({ name: 'division' })
export class DivisionEntity extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    divisionName: string;

    @Column({ type: 'boolean', default: true })
    status: boolean;

    @OneToMany(() => UserEntity, (user) => user.division, { onDelete: 'CASCADE' })
    users: UserEntity[];
}