import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { EventEntity } from '../event/event.entity';
import { EStatusBudgets } from 'src/common/enum/enum';

@Entity({ name: 'budgets' })
export class BudgetEntity extends BaseEntity {
  @Column({ type: 'nvarchar' })
  budgetName: string;

  @Column({ type: 'float', default: 0 })
  estExpense: number;

  @Column({ type: 'float', default: 0 })
  realExpense: number;

  @Column({ type: 'nvarchar' })
  description: string;

  @Column({
    enum: EStatusBudgets,
    type: 'enum',
    default: EStatusBudgets.PROCESSING,
  })
  status: EStatusBudgets;

  @ManyToOne(() => EventEntity, (event) => event.budgets, {
    onDelete: 'CASCADE',
  })
  event: EventEntity;

  @Column({ nullable: true })
  createBy: string;

  @Column({ nullable: true })
  approveBy: string;

  @Column({ nullable: true })
  approveDate: Date;

  @Column({ type: 'text', nullable: true })
  urlImage: string;

  @Column({ nullable: true })
  supplier: string;
}
