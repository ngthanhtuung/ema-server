import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GroupsMessageEntity } from '../groups_messages/groups_messages.entity';

@Entity({ name: 'group_message_attachments' })
export class GroupsMessageAttachmentEntity {
  @PrimaryGeneratedColumn('uuid')
  key: string;

  @ManyToOne(() => GroupsMessageEntity, (message) => message.attachments, {
    onDelete: 'CASCADE',
  })
  message: GroupsMessageEntity;
}
