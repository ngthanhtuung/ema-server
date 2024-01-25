import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Transform } from 'class-transformer';
import * as moment from 'moment-timezone';
import { EContactInformation } from 'src/common/enum/enum';

@Entity({ name: 'customer_contacts' })
export class CustomerContactEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  fullName: string;
  @Column({ type: 'varchar', nullable: false })
  email: string;
  @Column({ type: 'varchar', nullable: false })
  phoneNumber: string;
  @Column({ type: 'varchar', nullable: true })
  note: string;
  @Column({ type: 'varchar', nullable: true })
  processedBy: string;

  @CreateDateColumn({ type: 'datetime' })
  @Transform(({ value }) => {
    return moment(value).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
  })
  public createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  public updateAt: Date;

  @Column({ type: 'varchar', nullable: true })
  public updatedBy: string;

  @Column({ type: 'text', nullable: true })
  public rejectNote: string;

  @Column({
    type: 'enum',
    enum: EContactInformation,
    default: EContactInformation.PENDING,
  })
  status: EContactInformation;
}
