import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { UserEntity } from '../user/user.entity';
import { MessageEntity } from '../messages/messages.entity';
import { Transform } from 'class-transformer';
import moment from 'moment';

@Entity({ name: 'conversations' })
export class ConversationsEntity extends BaseEntity {
  @OneToOne(() => UserEntity, { createForeignKeyConstraints: false })
  @JoinColumn()
  creator: UserEntity;

  @OneToOne(() => UserEntity, { createForeignKeyConstraints: false })
  @JoinColumn()
  recipient: UserEntity;

  @OneToMany(() => MessageEntity, (message) => message.conversation, {
    cascade: ['insert', 'remove', 'update'],
  })
  @JoinColumn()
  messages: MessageEntity[];

  @OneToOne(() => MessageEntity)
  @JoinColumn({ name: 'last_message_sent' })
  lastMessageSent: MessageEntity;

  @UpdateDateColumn({ name: 'updated_at' })
  @Transform(({ value }) => {
    return moment(value).tz('Asia/Bangkok').toDate();
  })
  lastMessageSentAt: Date;
}
