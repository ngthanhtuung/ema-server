import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { UserEntity } from '../user/user.entity';
import { GroupsEntity } from '../groups/groups.entity';
import { GroupsMessageAttachmentEntity } from '../groups_messages_attachments/groups_messages_attachments.entity';

@Entity({ name: 'group_messages' })
export class GroupsMessageEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  content: string;

  @ManyToOne(() => UserEntity, (user) => user.messages)
  author: UserEntity;

  @ManyToOne(() => GroupsEntity, (group) => group.messages)
  group: GroupsEntity;

  @OneToMany(
    () => GroupsMessageAttachmentEntity,
    (attachment) => attachment.message,
  )
  @JoinColumn()
  attachments?: GroupsMessageAttachmentEntity[];
}
