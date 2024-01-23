import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { ETypeMessage } from 'src/common/enum/enum';
import { Transform } from 'class-transformer';
import moment from 'moment';
import { DeletedMessagesEntity } from '../deleted_messages/deleted_messages.entity';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'messages' })
export class MessageEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  message: string;

  @Column({ type: 'enum', enum: ETypeMessage, nullable: false })
  messageType: ETypeMessage;

  @Column({ type: 'varchar', nullable: false })
  senderId: string;

  @Column({ type: 'boolean', default: false })
  isDelete: boolean;

  @CreateDateColumn()
  @Transform(({ value }) => {
    return moment(value).format('YYYY-MM-DD HH:mm:ss');
  })
  deletedAt: Date;

  @OneToMany(
    () => DeletedMessagesEntity,
    (deletedMessages) => deletedMessages.messages,
  )
  deletedMessages: DeletedMessagesEntity[];

  @ManyToOne(() => UserEntity, (user) => user.messages)
  user: UserEntity;
}
