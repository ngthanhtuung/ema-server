import { EReplyRequest } from 'src/common/enum/enum';
import { BaseEntity } from '../base/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { RequestTypeEntity } from '../request-type/request-type.entity';

@Entity({ name: 'request' })
export class RequestEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column({
    type: 'enum',
    enum: EReplyRequest,
    default: EReplyRequest.PENDING,
  })
  replyStatus: EReplyRequest;

  @Column({ type: 'varchar' })
  replyMessage: string;

  @ManyToOne(() => UserEntity, (user) => user.requests, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => RequestTypeEntity, (requestType) => requestType.requests, {
    onDelete: 'CASCADE',
  })
  requestType: RequestTypeEntity;
}
