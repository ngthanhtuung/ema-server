import { TaskEntity } from './../task/task.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { EEventStatus } from 'src/common/enum/enum';
import { BudgetEntity } from '../budget/budget.entity';
import { AssignEventEntity } from '../assign-event/assign-event.entity';

@Entity({ name: 'events' })
export class EventEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  eventName: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'varchar' })
  location: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar' })
  coverUrl: string;

  @Column({ type: 'float' })
  estBudget: number;

  @Column({
    enum: EEventStatus,
    type: 'enum',
    default: EEventStatus.PENDING,
  })
  status: EEventStatus;

  @OneToMany(() => BudgetEntity, (budget) => budget.event, {
    onDelete: 'CASCADE',
  })
  budgets: BudgetEntity[];

  @OneToMany(() => TaskEntity, (tasks) => tasks.event, { onDelete: 'CASCADE' })
  tasks: TaskEntity[];

  @OneToMany(() => AssignEventEntity, (assginEvent) => assginEvent.event, {
    onDelete: 'CASCADE',
  })
  assignEvents: [];
}
