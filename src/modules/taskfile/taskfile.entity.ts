import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { TaskEntity } from '../task/task.entity';

@Entity({ name: 'task_file' })
export class TaskFileEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  fileType: string;

  @Column({ type: 'varchar', nullable: false })
  fileUrl: string;

  @ManyToOne(() => TaskEntity, (task) => task.taskFiles, {
    onDelete: 'CASCADE',
  })
  task: TaskEntity;
}
