import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { ItemEntity } from '../items/items.entity';
import { TaskEntity } from '../task/task.entity';
import { TransactionEntity } from './transactions.entity';

@Entity({ name: 'budgets' })
export class BudgetEntity extends BaseEntity {
  @ManyToOne(() => ItemEntity, (item) => item.budgets, { onDelete: 'CASCADE' })
  item: ItemEntity;

  @ManyToOne(() => TaskEntity, (task) => task.budgets, { onDelete: 'CASCADE' })
  task: TaskEntity;

  @OneToMany(() => TransactionEntity, (transactions) => transactions.budget, {
    onDelete: 'CASCADE',
  })
  transactions: TransactionEntity[];
}
