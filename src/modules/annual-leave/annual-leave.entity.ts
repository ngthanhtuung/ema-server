import { Column, Entity } from "typeorm";
import { BaseEntity } from "../base/base.entity";

@Entity({ name: 'annual_leave' })
export class AnnualLeave extends BaseEntity {

    @Column({ type: 'int' })
    year: number;

    @Column({ type: 'float' })
    amount: number;
}