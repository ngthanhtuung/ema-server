import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { EventEntity } from '../event/event.entity';

@Entity({ name: 'budgets' })
export class BudgetEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  budgetName: string;

  @Column({ type: 'boolean', default: true })
  expense: boolean;

  @Column({ type: 'float', default: 0 })
  amount: number;

  @Column({ type: 'varchar' })
  description: string;

  @ManyToOne(() => EventEntity, (event) => event.budgets, {
    onDelete: 'CASCADE',
  })
  event: EventEntity;
}
