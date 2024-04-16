import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { EEventStatus } from 'src/common/enum/enum';
import { AssignEventEntity } from '../assign-event/assign-event.entity';
import { ContractEntity } from '../contracts/contracts.entity';
import { EventTypeEntity } from '../event_types/event_types.entity';
import { Transform } from 'class-transformer';
import * as moment from 'moment-timezone';

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

  @Column({ type: 'varchar', nullable: true })
  meetingUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  coverUrl: string;

  @Column({ type: 'float' })
  estBudget: number;

  @Column({ type: 'boolean', default: false })
  isTemplate: boolean;

  @Column({
    enum: EEventStatus,
    type: 'enum',
    default: EEventStatus.PENDING,
  })
  status: EEventStatus;

  @CreateDateColumn()
  @Transform(({ value }) => {
    return moment(value).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
  })
  public createdAt: Date;

  @Column({ type: 'varchar', nullable: false })
  createdBy: string;

  @UpdateDateColumn()
  @Transform(({ value }) => {
    return moment(value).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
  })
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string;

  @OneToMany(() => AssignEventEntity, (assignEvent) => assignEvent.event, {
    onDelete: 'CASCADE',
  })
  assignEvents: AssignEventEntity[];

  @OneToOne(() => ContractEntity, (contract) => contract.event)
  @JoinColumn()
  contract: ContractEntity;

  @ManyToOne(() => EventTypeEntity, (type) => type.events)
  eventType: EventTypeEntity;
}
