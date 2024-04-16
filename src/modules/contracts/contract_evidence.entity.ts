import { Column, CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { ContractEntity } from './contracts.entity';
import { Transform } from 'class-transformer';
import moment from 'moment';
import { EContractEvidenceType } from '../../common/enum/enum';
import { PaymentMilestoneEntity } from './payment_milestone.entity';

@Entity({ name: 'contract_evidences' })
export class ContractEvidenceEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  evidenceFileName: string;

  @Column({ type: 'integer', nullable: false })
  evidenceFileSize: number;

  @Column({ type: 'varchar', nullable: false })
  evidenceFileType: string;

  @Column({ type: 'text', nullable: false })
  evidenceUrl: string;

  @Column({
    type: 'enum',
    enum: EContractEvidenceType,
  })
  evidenceType: EContractEvidenceType;

  @CreateDateColumn()
  @Transform(({ value }) => {
    return moment(value).format('YYYY-MM-DD HH:mm:ss');
  })
  createdAt: Date;

  @Column({ type: 'varchar', nullable: false })
  createdBy: string;

  @ManyToOne(() => ContractEntity, (contract) => contract.evidences)
  contract: ContractEntity;

  @ManyToOne(() => PaymentMilestoneEntity, (milestone) => milestone.evidences, {
    onDelete: 'CASCADE',
  })
  milestone: PaymentMilestoneEntity;
}
