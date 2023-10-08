import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { TaskEntity } from '../task/task.entity';

@Entity({ name: 'assign-tasks' })
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
}
