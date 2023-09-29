import { Column, Entity } from "typeorm";
import { BaseEntity } from "../base/base.entity";

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
}