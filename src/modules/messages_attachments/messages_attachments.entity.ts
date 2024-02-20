import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { MessageEntity } from '../messages/messages.entity';

@Entity({ name: 'message_attachments' })
export class MessageAttachmentsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  key: string;

  @ManyToOne(() => MessageEntity, (message) => message.attachments, {
    onDelete: 'CASCADE',
  })
  messages: MessageEntity;
}
