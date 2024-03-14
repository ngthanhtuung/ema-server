import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Transform } from 'class-transformer';
import * as moment from 'moment-timezone';
import { EContactInformation } from 'src/common/enum/enum';
import { EventTypeEntity } from '../event_types/event_types.entity';
import { ItemEntity } from '../items/items.entity';
import { ContractEntity } from '../contracts/contracts.entity';

@Entity({ name: 'customer_contacts' })
export class CustomerContactEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  fullName: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: false })
  phoneNumber: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'varchar', nullable: true })
  eventName: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'float', nullable: true })
  budget: number;

  @Column({ type: 'varchar', nullable: true })
  processedBy: string;

  @CreateDateColumn({ type: 'datetime' })
  @Transform(({ value }) => {
    return moment(value).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
  })
  createdAt: Date;

  @Column({ type: 'varchar', nullable: false })
  createdBy: string;

  @Column({ type: 'datetime', nullable: true })
  updateAt: Date;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string;

  @Column({ type: 'text', nullable: true })
  rejectNote: string;

  @Column({
    type: 'enum',
    enum: EContactInformation,
    default: EContactInformation.PENDING,
  })
  status: EContactInformation;

  @ManyToOne(() => EventTypeEntity, (eventType) => eventType.customerContacts)
  eventType: EventTypeEntity;

  @OneToMany(() => ItemEntity, (item) => item.customerInfo)
  items: ItemEntity[];

  @OneToOne(() => ContractEntity, (contract) => contract.customerContact)
  contract: ContractEntity;
}
