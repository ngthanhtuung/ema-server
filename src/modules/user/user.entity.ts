import { BaseEntity } from 'src/modules/base/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { NotificationEntity } from '../notification/notification.entity';
import { DeviceEntity } from '../device/device.entity';
import { DivisionEntity } from '../division/division.entity';
import { CommentEntity } from '../comment/comment.entity';
import { ETypeEmployee, EUserStatus } from 'src/common/enum/enum';
import { AssignTaskEntity } from '../assign-task/assign-task.entity';
import { ProfileEntity } from '../profile/profile.entity';
import { RoleEntity } from '../roles/roles.entity';
import { UserNotificationsEntity } from '../user_notifications/user_notifications.entity';
import { MessageEntity } from '../messages/messages.entity';
import { DeletedMessagesEntity } from '../deleted_messages/deleted_messages.entity';
import { ParticipantsEntity } from '../participants/participants.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({ unique: true, type: 'varchar', length: 50 })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  authCode: string;

  @Column({ type: 'datetime', nullable: true })
  issueDate: Date;

  @Column({
    enum: EUserStatus,
    type: 'enum',
    default: EUserStatus.ACTIVE,
  })
  status: EUserStatus;

  @Column({
    enum: ETypeEmployee,
    type: 'enum',
    default: ETypeEmployee.FULL_TIME,
  })
  typeEmployee: ETypeEmployee;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string;

  @OneToMany(() => DeviceEntity, (device) => device.user, {
    onDelete: 'CASCADE',
  })
  devices: DeviceEntity[];

  @ManyToOne(() => DivisionEntity, (division) => division.users, {
    onDelete: 'CASCADE',
  })
  division: DivisionEntity;

  @OneToMany(() => CommentEntity, (comments) => comments.user, {
    onDelete: 'CASCADE',
  })
  comments: CommentEntity[];

  @OneToMany(() => AssignTaskEntity, (assignee) => assignee.user)
  assignee: AssignTaskEntity[];

  @OneToOne(() => ProfileEntity, (profile) => profile.user)
  @JoinColumn({ name: 'profileId' })
  // @JoinColumn()
  profile: ProfileEntity;

  @ManyToOne(() => RoleEntity, (role) => role.users, {
    onDelete: 'CASCADE',
  })
  role: RoleEntity;

  @OneToMany(
    () => UserNotificationsEntity,
    (userNotification) => userNotification.user,
  )
  userNotifications: UserNotificationsEntity[];

  @OneToMany(() => MessageEntity, (message) => message.user)
  messages: MessageEntity[];

  @OneToMany(
    () => DeletedMessagesEntity,
    (deletedMessages) => deletedMessages.user,
  )
  deletedMessages: DeletedMessagesEntity[];

  @OneToMany(() => ParticipantsEntity, (participant) => participant.user)
  participants: ParticipantsEntity[];

  @Column({ type: 'varchar', nullable: true })
  socketId: string;
}
