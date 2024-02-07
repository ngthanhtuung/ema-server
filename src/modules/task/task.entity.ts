import { EPriority, ETaskStatus } from 'src/common/enum/enum';
import { BaseEntity } from '../base/base.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CommentEntity } from '../comment/comment.entity';
import { AssignTaskEntity } from '../assign-task/assign-task.entity';
import { TaskFileEntity } from '../taskfile/taskfile.entity';
import { AssignEventEntity } from '../assign-event/assign-event.entity';
import { Transform } from 'class-transformer';
import moment from 'moment';

@Entity({ name: 'tasks' })
export class TaskEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  code: string;

  @Column({ type: 'datetime', nullable: true })
  startDate: Date;

  @Column({ type: 'datetime', nullable: true })
  endDate: Date;

  @Column({ type: 'varchar', nullable: true, length: 15000 })
  description: string;

  @Column({ type: 'integer', nullable: false })
  priority: number;

  @Column({ type: 'varchar', nullable: true })
  parentTask: string;

  @Column({
    type: 'integer',
    default: 0,
  })
  progress: number;

  @Column({
    type: 'enum',
    enum: ETaskStatus,
    default: ETaskStatus.PENDING,
  })
  status: ETaskStatus;

  @Column({ type: 'float', nullable: true })
  estimationTime: number;

  @Column({ type: 'float', nullable: true })
  effort: number;

  @CreateDateColumn()
  @Transform(({ value }) => {
    return moment(value).format('YYYY-MM-DD HH:mm:ss');
  })
  public createdAt: Date;

  @Column({ type: 'varchar' })
  createdBy: string;

  @Column({ type: 'varchar', nullable: true })
  modifiedBy: string;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @ManyToOne(() => TaskEntity, (task) => task.subTask)
  @JoinColumn({ name: 'parentTask' })
  parent: TaskEntity;

  @OneToMany(() => TaskEntity, (task) => task.parent)
  subTask: TaskEntity[];

  @ManyToOne(() => AssignEventEntity, (eventDivision) => eventDivision.tasks)
  eventDivision: AssignEventEntity;

  @OneToMany(() => TaskFileEntity, (taskFiles) => taskFiles.task, {
    onDelete: 'CASCADE',
  })
  taskFiles: TaskFileEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.task, {
    onDelete: 'CASCADE',
  })
  comments: CommentEntity[];

  @OneToMany(() => AssignTaskEntity, (assignTasks) => assignTasks.task, {
    onDelete: 'CASCADE',
  })
  assignTasks: AssignTaskEntity[];
}
