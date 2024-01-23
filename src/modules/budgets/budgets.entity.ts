import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { ItemEntity } from '../items/items.entity';

@Entity({ name: 'budgets' })
export class BudgetEntity extends BaseEntity {
  @Column({ type: 'float', nullable: false })
  amount: number;

  @Column({ type: 'float' })
  plannedAmount: number;

  @Column({ type: 'float' })
  actualSpend: number;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar' })
  note: string;

  @ManyToOne(() => ItemEntity, (item) => item.budgets)
  item: ItemEntity;
}
