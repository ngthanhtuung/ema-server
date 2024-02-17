import { BaseEntity } from 'src/modules/base/base.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { DeviceEntity } from '../device/device.entity';
import { DivisionEntity } from '../division/division.entity';
import { CommentEntity } from '../comment/comment.entity';
import { ETypeEmployee, EUserStatus } from 'src/common/enum/enum';
import { AssignTaskEntity } from '../assign-task/assign-task.entity';
import { ProfileEntity } from '../profile/profile.entity';
import { RoleEntity } from '../roles/roles.entity';
import { UserNotificationsEntity } from '../user_notifications/user_notifications.entity';
import { MessageEntity } from '../messages/messages.entity';
import { GroupsEntity } from '../groups/groups.entity';

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
    default: null,
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

  @OneToMany(() => AssignTaskEntity, (assignee) => assignee.user, {
    onDelete: 'CASCADE',
  })
  assignee: AssignTaskEntity[];

  @OneToOne(() => ProfileEntity, (profile) => profile.user, {
    onDelete: 'CASCADE',
  })
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

  @OneToMany(() => MessageEntity, (message) => message.author)
  messages: MessageEntity[];

  @Column({ type: 'varchar', nullable: true })
  socketId: string;

  @ManyToMany(() => GroupsEntity, (group) => group.users)
  groups: GroupsEntity[];
}
