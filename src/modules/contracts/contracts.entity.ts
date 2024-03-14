import { ContractEvidenceEntity } from './contract_evidence.entity';
import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { EventEntity } from '../event/event.entity';
import { Transform } from 'class-transformer';
import * as moment from 'moment-timezone';
import { ContractFileEntity } from './contract_files.entity';
import { CustomerContactEntity } from '../customer_contacts/customer_contacts.entity';
import { EContactInformation, EContractStatus } from '../../common/enum/enum';

@Entity({ name: 'contracts' })
export class ContractEntity extends BaseEntity {
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

  @Column({
    type: 'enum',
    enum: EContractStatus,
    default: EContractStatus.PENDING,
  })
  status: EContractStatus;

  @OneToMany(() => ContractFileEntity, (file) => file.contract, {
    onDelete: 'CASCADE',
  })
  files: ContractFileEntity[];

  @OneToOne(() => EventEntity, (event) => event.contract)
  event: EventEntity;

  @OneToMany(() => ContractEvidenceEntity, (evidence) => evidence.contract)
  evidences: ContractEvidenceEntity[];

  @OneToOne(
    () => CustomerContactEntity,
    (customerContact) => customerContact.contract,
  )
  @JoinColumn()
  customerContact: CustomerContactEntity;
}
