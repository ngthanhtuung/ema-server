import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { CategoryEntity } from '../categories/categories.entity';
import { CustomerContactEntity } from '../customer_contacts/customer_contacts.entity';
import { TaskEntity } from '../task/task.entity';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

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

  @Column({
    type: 'integer',
    nullable: true,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  percentage: number;

  @ManyToOne(() => CustomerContactEntity, (customerInfo) => customerInfo.items)
  customerInfo: CustomerContactEntity;

  @Column({ type: 'varchar', nullable: false })
  createdBy: string;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string;

  @ManyToOne(() => CategoryEntity, (category) => category.items)
  category: CategoryEntity;

  @OneToMany(() => TaskEntity, (tasks) => tasks.item, { onDelete: 'CASCADE' })
  tasks: TaskEntity[];

  @Column({ type: 'datetime', nullable: true })
  plannedStartDate: Date;

  @Column({ type: 'datetime', nullable: true })
  plannedEndDate: Date;
}
