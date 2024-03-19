import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { ETransaction } from '../../common/enum/enum';
import { Transform } from 'class-transformer';
import * as moment from 'moment-timezone';
import { TaskEntity } from '../task/task.entity';
import { TransactionEvidenceEntity } from './transaction_evidence.entity';

@Entity({ name: 'transactions' })
export class TransactionEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  transactionCode: string;

  @Column({ type: 'varchar', nullable: false })
  transactionName: string;

  @Column({ type: 'varchar', nullable: false })
  description: string;

  @Column({ type: 'float', nullable: false })
  amount: number;

  @Column({ type: 'varchar', nullable: true })
  processedBy: string;

  @Column({ type: 'varchar', nullable: true })
  rejectNote: string;

  @Column({
    type: 'enum',
    enum: ETransaction,
    default: ETransaction.PENDING,
  })
  status: ETransaction;

  @CreateDateColumn()
  @Transform(({ value }) => {
    return moment(value).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
  })
  createdAt: Date;

  @Column({ type: 'varchar', nullable: false })
  createdBy: string;

  @UpdateDateColumn()
  @Transform(({ value }) => {
    return moment(value).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
  })
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string;

  @ManyToOne(() => TaskEntity, (task) => task.transactions, {
    onDelete: 'CASCADE',
  })
  task: TaskEntity;

  @OneToMany(
    () => TransactionEvidenceEntity,
    (evidences) => evidences.transaction,
    { onDelete: 'CASCADE' },
  )
  evidences: TransactionEvidenceEntity[];
}
