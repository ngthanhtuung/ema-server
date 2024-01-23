import { Entity, ManyToOne } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { MessageEntity } from '../messages/messages.entity';
import { BaseEntity } from '../base/base.entity';

@Entity({ name: 'deleted_messages' })
export class DeletedMessagesEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.deletedMessages)
  user: UserEntity;

  @ManyToOne(() => MessageEntity, (message) => message.deletedMessages)
  messages: MessageEntity;
}
