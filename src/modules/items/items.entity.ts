import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { CategoryEntity } from '../categories/categories.entity';
import { BudgetEntity } from '../budgets/budgets.entity';
import { CustomerContactEntity } from '../customer_contacts/customer_contacts.entity';

@Entity({ name: 'items' })
export class ItemEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  itemName: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'integer', nullable: false })
  plannedAmount: number;

  @Column({ type: 'float', nullable: false })
  plannedPrice: number;

  @Column({ type: 'varchar', nullable: false })
  plannedUnit: string;

  @Column({
    type: 'integer',
    nullable: false,
    default: 5,
  })
  priority: number;

  @ManyToOne(() => CustomerContactEntity, (customerInfo) => customerInfo.items)
  customerInfo: CustomerContactEntity;

  @Column({ type: 'varchar', nullable: false })
  createdBy: string;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string;

  @ManyToOne(() => CategoryEntity, (category) => category.items)
  category: CategoryEntity;

  @OneToMany(() => BudgetEntity, (budget) => budget.item, {
    onDelete: 'CASCADE',
  })
  budgets: BudgetEntity[];
}
