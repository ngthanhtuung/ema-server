import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { ItemEntity } from '../items/items.entity';

@Entity({ name: 'budgets' })
export class BudgetEntity extends BaseEntity {
  @Column({ type: 'integer', nullable: true })
  actualAmount: number;

  @Column({ type: 'float', nullable: true })
  actualPrice: number;

  @Column({ type: 'varchar', nullable: true })
  actualUnit: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  note: string;

  @ManyToOne(() => ItemEntity, (item) => item.budgets, { onDelete: 'CASCADE' })
  item: ItemEntity;
}
