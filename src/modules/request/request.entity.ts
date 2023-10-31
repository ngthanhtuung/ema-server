import { EReplyRequest, ERequestStatus } from 'src/common/enum/enum';
import { BaseEntity } from '../base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { RequestTypeEntity } from '../request-type/request-type.entity';

@Entity({ name: 'requests' })
export class RequestEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ default: true })
  isFull: boolean;

  @Column({ default: false })
  isPM: boolean;

  @Column({ nullable: true })
  approver: string;

  @Column({
    default: ERequestStatus.PENDING,
  })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  replyMessage: string;

  @Column({ type: 'varchar' })
  requestor: string;

  @Column({ type: 'varchar' })
  type: string;

  @ManyToOne(() => UserEntity, (approveBy) => approveBy.approveReq)
  @JoinColumn({
    name: 'approver',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'id',
  })
  approveBy: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestor', referencedColumnName: 'id' })
  user: UserEntity;
}
