import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { EventEntity } from '../event/event.entity';

@Entity({ name: 'contracts' })
export class ContractEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  customerName: string;

  @Column({ type: 'char', nullable: false })
  customerNationalId: string;

  @Column({ type: 'varchar', nullable: false })
  customerEmail: string;

  @Column({ type: 'varchar', nullable: false })
  customerPhoneNumber: string;

  @Column({ type: 'date', nullable: false })
  dateOfSigning: Date;

  @Column({ type: 'varchar', nullable: false })
  companyRepresentative: string;

  @Column({ type: 'varchar', nullable: false })
  contractFileName: string;

  @Column({ type: 'varchar', nullable: false })
  contractFileSize: string;

  @ManyToOne(() => EventEntity, (event) => event.contracts)
  event: EventEntity;
}
