import { TaskEntity } from './../task/task.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { EEventStatus } from 'src/common/enum/enum';
import { BudgetEntity } from '../budget/budget.entity';
import { AssignEventEntity } from '../assign-event/assign-event.entity';
import { TimesheetEntity } from '../timesheet/timesheet.entity';

@Entity({ name: 'events' })
export class EventEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  eventName: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  processingDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'varchar' })
  location: string;

  @Column({ type: 'varchar', length: 15000 })
  description: string;

  @Column({ type: 'text' })
  coverUrl: string;

  @Column({ type: 'float' })
  estBudget: number;

  @Column({ type: 'text', nullable: true })
  checkInQRCode: string;

  @Column({ type: 'text', nullable: true })
  checkOutQRCode: string;

  @Column({ type: 'boolean', default: false })
  isTemplate: boolean;

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

  @OneToMany(() => TimesheetEntity, (timesheet) => timesheet.event, {
    onDelete: 'CASCADE',
  })
  timesheets: TimesheetEntity[];
}
