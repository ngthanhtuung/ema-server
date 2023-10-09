import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { TaskEntity } from '../task/task.entity';

@Entity({ name: 'task_files' })
export class TaskFileEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  fileUrl: string;

  @Column({ type: 'varchar', nullable: true })
  taskID: string;

  @ManyToOne(() => TaskEntity, (task) => task.taskFiles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'taskID', referencedColumnName: 'id' })
  task: TaskEntity;
}
