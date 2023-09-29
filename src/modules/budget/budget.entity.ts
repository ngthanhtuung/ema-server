import { Column, Entity } from "typeorm";
import { BaseEntity } from "../base/base.entity";

@Entity({ name: 'budget' })
export class BudgetEntity extends BaseEntity {

    @Column({ type: 'varchar' })
    budgetName: string;

    @Column({ type: 'boolean', default: true })
    expense: boolean;

    @Column({ type: 'float', default: 0 })
    amount: number;

    @Column({ type: 'varchar' })
    description: string;
}