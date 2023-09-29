import { BaseEntity } from 'src/modules/base/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { TimesheetEntity } from '../timesheet/timesheet.entity';
import { RequestEntity } from '../request/request.entity';
import { NotificationEntity } from '../notification/notification.entity';
import { DeviceEntity } from '../device/device.entity';
import { DivisionEntity } from '../division/division.entity';
import { AnnualLeaveEntity } from '../annual-leave/annual-leave.entity';
import { TaskEntity } from '../task/task.entity';
import { CommentEntity } from '../comment/comment.entity';

@Entity({ name: 'account' })
export class AccountEntity extends BaseEntity {
  @Column({ unique: true, type: 'varchar', length: 50 })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  authCode: string;

  @Column({ type: 'datetime', nullable: true })
  issueDate: Date;

  @OneToMany(() => TimesheetEntity, (timesheet) => timesheet.account, { onDelete: 'CASCADE' })
  timesheets: TimesheetEntity[];

  @OneToMany(() => RequestEntity, (request) => request.account, { onDelete: 'CASCADE' })
  requests: RequestEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.account, { onDelete: 'CASCADE' })
  notifications: NotificationEntity[];

  @OneToMany(() => DeviceEntity, (device) => device.account, { onDelete: 'CASCADE' })
  devices: DeviceEntity[];

  @ManyToOne(() => DivisionEntity, (division) => division.accounts, { onDelete: 'CASCADE' })
  division: DivisionEntity;

  @OneToMany(() => AnnualLeaveEntity, (annualLeaves) => annualLeaves.account, { onDelete: 'CASCADE' })
  annualLeaves: AnnualLeaveEntity[];

  @OneToMany(() => TaskEntity, (tasks) => tasks.account, { onDelete: 'CASCADE' })
  tasks: TaskEntity[];

  @OneToMany(() => CommentEntity, (comments) => comments.account, { onDelete: 'CASCADE' })
  comments: CommentEntity[];
}