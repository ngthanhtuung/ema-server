import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "../base/base.entity";
import { AccountEntity } from "../account/account.entity";

@Entity({ name: 'annual_leave' })
export class AnnualLeaveEntity extends BaseEntity {

    @Column({ type: 'int' })
    year: number;

    @Column({ type: 'float' })
    amount: number;

    @ManyToOne(() => AccountEntity, (account) => account.annualLeaves, { onDelete: 'CASCADE' })
    account: AccountEntity;
}