import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "../base/base.entity";
import { AccountEntity } from "../account/account.entity";

@Entity({ name: 'timesheet' })
export class TimesheetEntity extends BaseEntity {

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'time' })
    checkinTime: Date;

    @Column({ type: 'varchar' })
    checkinLocation: string;

    @Column({ type: 'time' })
    checkoutTime: Date;

    @Column({ type: 'varchar' })
    checkoutLocation: string;

    @ManyToOne(() => AccountEntity, (account) => account.timesheets, { onDelete: 'CASCADE' })
    account: AccountEntity;
}