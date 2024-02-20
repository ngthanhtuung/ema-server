import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { UserEntity } from '../user/user.entity';
import { ConversationsEntity } from '../conversations/conversations.entity';
import { MessageAttachmentsEntity } from '../messages_attachments/messages_attachments.entity';

@Entity({ name: 'messages' })
export class MessageEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  content: string;

  @ManyToOne(() => UserEntity, (user) => user.messages)
  author: UserEntity;

  @ManyToOne(() => ConversationsEntity, (conversation) => conversation.messages)
  conversation: ConversationsEntity;

  @OneToMany(
    () => MessageAttachmentsEntity,
    (attachment) => attachment.messages,
  )
  @JoinColumn()
  attachments: MessageAttachmentsEntity[];
}
