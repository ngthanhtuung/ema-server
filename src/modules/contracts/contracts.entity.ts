import { ContractEvidenceEntity } from './contract_evidence.entity';
import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { EventEntity } from '../event/event.entity';
import { Transform } from 'class-transformer';
import * as moment from 'moment-timezone';

@Entity({ name: 'contracts' })
export class ContractEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false, unique: true })
  contractCode: string;

  @Column({ type: 'varchar', nullable: false })
  customerName: string;

  @Column({ type: 'varchar', nullable: false })
  customerNationalId: string;

  @Column({ type: 'varchar', nullable: false })
  customerEmail: string;

  @Column({ type: 'varchar', nullable: false })
  customerPhoneNumber: string;

  @Column({ type: 'varchar', nullable: false })
  customerAddress: string;

  @Column({ type: 'datetime', nullable: true })
  dateOfSigning: Date;

  @Column({ type: 'varchar', nullable: false })
  companyRepresentative: string;

  @Column({ type: 'varchar', nullable: true })
  contractFileName: string;

  @Column({ type: 'integer', nullable: true })
  contractFileSize: number;

  @Column({ type: 'text', nullable: true })
  contractFileUrl: string;

  @Column({ type: 'varchar', nullable: false })
  paymentMethod: string;

  @CreateDateColumn()
  @Transform(({ value }) => {
    return moment(value).format('YYYY-MM-DD HH:mm:ss');
  })
  createdAt: Date;

  @Column({ type: 'varchar', nullable: false })
  createdBy: string;

  @UpdateDateColumn()
  @Transform(({ value }) => {
    return moment(value).format('YYYY-MM-DD HH:mm:ss');
  })
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string;

  @ManyToOne(() => EventEntity, (event) => event.contracts)
  event: EventEntity;

  @OneToMany(() => ContractEvidenceEntity, (evidence) => evidence.contract)
  evidences: ContractEvidenceEntity[];
}
