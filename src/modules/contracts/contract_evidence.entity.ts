import { Column, CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { ContractEntity } from './contracts.entity';
import { Transform } from 'class-transformer';
import moment from 'moment';

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

  @CreateDateColumn()
  @Transform(({ value }) => {
    return moment(value).format('YYYY-MM-DD HH:mm:ss');
  })
  public createdAt: Date;

  @Column({ type: 'varchar', nullable: false })
  createdBy: string;

  @ManyToOne(() => ContractEntity, (contract) => contract.evidences)
  contract: ContractEntity;
}
