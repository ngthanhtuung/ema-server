import { TaskEntity } from './../task/task.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { EEventStatus } from 'src/common/enum/enum';
import { AssignEventEntity } from '../assign-event/assign-event.entity';
import { FeedbackEntity } from '../feedbacks/feedbacks.entity';
import { ContractEntity } from '../contracts/contracts.entity';
import { EventTypeEntity } from '../event_types/event_types.entity';
import { ItemEntity } from '../items/items.entity';

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

  // @OneToMany(() => TaskEntity, (tasks) => tasks.event, { onDelete: 'CASCADE' })
  // tasks: TaskEntity[];

  @OneToMany(() => AssignEventEntity, (assginEvent) => assginEvent.event, {
    onDelete: 'CASCADE',
  })
  assignEvents: [];

  @OneToMany(() => FeedbackEntity, (feedback) => feedback.event)
  feedbacks: FeedbackEntity[];

  @OneToMany(() => ContractEntity, (contract) => contract.event)
  contracts: ContractEntity[];

  @ManyToOne(() => EventTypeEntity, (type) => type.events)
  eventType: EventTypeEntity;

  @OneToMany(() => ItemEntity, (item) => item.event)
  items: ItemEntity[];
}
