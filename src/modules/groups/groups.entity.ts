import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { UserEntity } from '../user/user.entity';
import { GroupsMessageEntity } from '../groups_messages/groups_messages.entity';

@Entity({ name: 'groups' })
export class GroupsEntity extends BaseEntity {
  @Column({ nullable: true })
  title?: string;

  @ManyToMany(() => UserEntity, (user) => user.groups)
  @JoinTable()
  users: UserEntity[];

  @OneToOne(() => UserEntity, { createForeignKeyConstraints: false })
  @JoinColumn()
  creator: UserEntity;

  @OneToOne(() => UserEntity, { createForeignKeyConstraints: false })
  @JoinColumn()
  owner: UserEntity;

  @OneToMany(() => GroupsMessageEntity, (message) => message.group, {
    cascade: ['insert', 'remove', 'update'],
  })
  @JoinColumn()
  messages: GroupsMessageEntity[];

  @OneToOne(() => GroupsMessageEntity)
  @JoinColumn({ name: 'last_message_sent' })
  lastMessageSent: GroupsMessageEntity;

  @UpdateDateColumn({ name: 'updated_at' })
  lastMessageSentAt: Date;

  @Column({ nullable: true })
  avatar?: string;
}
