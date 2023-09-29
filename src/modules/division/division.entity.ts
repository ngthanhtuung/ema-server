import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../base/base.entity";
import { AccountEntity } from "../account/account.entity";

@Entity({ name: 'division' })
export class DivisionEntity extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    divisionName: string;

    @Column({ type: 'boolean', default: true })
    status: boolean;

    @OneToMany(() => AccountEntity, (account) => account.division, { onDelete: 'CASCADE' })
    accounts: AccountEntity[];
}