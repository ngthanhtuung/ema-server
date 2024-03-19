import { Column, CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Transform } from 'class-transformer';
import moment from 'moment';
import { TransactionEntity } from './transactions.entity';

@Entity({ name: 'transaction_evidences' })
export class TransactionEvidenceEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  evidenceFileName: string;

  @Column({ type: 'integer', nullable: false })
  evidenceFileSize: number;

  @Column({ type: 'varchar', nullable: false })
  evidenceFileType: string;

  @Column({ type: 'text', nullable: false })
  evidenceUrl: string;

  @CreateDateColumn()
  @Transform(({ value }) => {
    return moment(value).format('YYYY-MM-DD HH:mm:ss');
  })
  createdAt: Date;

  @Column({ type: 'varchar', nullable: false })
  createdBy: string;

  @ManyToOne(() => TransactionEntity, (transaction) => transaction.evidences, {
    onDelete: 'CASCADE',
  })
  transaction: TransactionEntity;
}
