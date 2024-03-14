import { BaseEntity } from '../base/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { EContractStatus, EEventStatus } from '../../common/enum/enum';
import { ContractEntity } from './contracts.entity';

@Entity({ name: 'contract_files' })
export class ContractFileEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false, unique: true })
  contractCode: string;

  @Column({ type: 'varchar', nullable: true })
  contractFileName: string;

  @Column({ type: 'integer', nullable: true })
  contractFileSize: number;

  @Column({ type: 'text', nullable: true })
  contractFileUrl: string;

  @Column({ type: 'text', nullable: true })
  rejectNote?: string;

  @Column({
    enum: EContractStatus,
    type: 'enum',
    default: EContractStatus.PENDING,
  })
  status: EContractStatus;

  @ManyToOne(() => ContractEntity, (contract) => contract.files, {
    onDelete: 'CASCADE',
  })
  contract: ContractEntity;
}
