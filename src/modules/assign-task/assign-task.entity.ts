import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { TaskEntity } from '../task/task.entity';
import { UserEntity } from '../user/user.entity';
import { EStatusAssignee } from 'src/common/enum/enum';

@Entity({ name: 'assign_tasks' })
export class AssignTaskEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  assignee: string;

  @Column({ type: 'varchar' })
  taskMaster: string;

  @Column({ type: 'boolean', default: false })
  isLeader: boolean;

  @Column({ type: 'varchar' })
  taskID: string;

  @ManyToOne(() => TaskEntity, (task) => task.assignTasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'taskID', referencedColumnName: 'id' })
  task: TaskEntity;

  @ManyToOne(() => UserEntity, (user) => user.assignee, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assignee', referencedColumnName: 'id' })
  user: UserEntity;

  @Column({
    type: 'enum',
    default: EStatusAssignee.ACTIVE,
    enum: EStatusAssignee,
  })
  status: EStatusAssignee;
}
