import { BaseEntity } from 'src/modules/base/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TimesheetEntity } from '../timesheet/timesheet.entity';
import { RequestEntity } from '../request/request.entity';
import { NotificationEntity } from '../notification/notification.entity';
import { DeviceEntity } from '../device/device.entity';
import { DivisionEntity } from '../division/division.entity';
import { AnnualLeaveEntity } from '../annual-leave/annual-leave.entity';
import { CommentEntity } from '../comment/comment.entity';
import { EUserStatus } from 'src/common/enum/enum';
import { AssignTaskEntity } from '../assign-task/assign-task.entity';
import { ProfileEntity } from '../profile/profile.entity';

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

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string;

  @OneToMany(() => TimesheetEntity, (timesheet) => timesheet.user, {
    onDelete: 'CASCADE',
  })
  timesheets: TimesheetEntity[];

  @OneToMany(() => RequestEntity, (request) => request.user, {
    onDelete: 'CASCADE',
  })
  requests: RequestEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.user, {
    onDelete: 'CASCADE',
  })
  notifications: NotificationEntity[];

  @OneToMany(() => DeviceEntity, (device) => device.user, {
    onDelete: 'CASCADE',
  })
  devices: DeviceEntity[];

  @ManyToOne(() => DivisionEntity, (division) => division.users, {
    onDelete: 'CASCADE',
  })
  division: DivisionEntity;

  @OneToMany(() => AnnualLeaveEntity, (annualLeaves) => annualLeaves.user, {
    onDelete: 'CASCADE',
  })
  annualLeaves: AnnualLeaveEntity[];

  @OneToMany(() => CommentEntity, (comments) => comments.user, {
    onDelete: 'CASCADE',
  })
  comments: CommentEntity[];

  @OneToMany(() => AssignTaskEntity, (assignee) => assignee.user)
  assignee: AssignTaskEntity[];

  @OneToOne(() => ProfileEntity, (profile) => profile.user)
  @JoinColumn({ name: 'id' })
  profile: ProfileEntity;
}
