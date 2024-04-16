import { BaseEntity } from '../base/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ContractEntity } from './contracts.entity';
import { ContractEvidenceEntity } from './contract_evidence.entity';

@Entity({ name: 'payment_milestone' })
export class PaymentMilestoneEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'date', nullable: false })
  startDate: Date;
  @Column({ type: 'date', nullable: false })
  endDate: Date;

  @Column({ type: 'integer', nullable: false })
  amount: number;
  @Column({ type: 'boolean', default: false })
  status: boolean;

  @Column({ type: 'varchar', nullable: false })
  createdBy: string;

  @ManyToOne(() => ContractEntity, (contract) => contract.milestones, {
    onDelete: 'CASCADE',
  })
  contract: ContractEntity;

  @OneToMany(() => ContractEvidenceEntity, (evidences) => evidences.milestone, {
    onDelete: 'CASCADE',
  })
  evidences: ContractEvidenceEntity[];
}
