import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { TaskEntity } from '../task/task.entity';
import { CommentFileEntity } from '../commentfile/commentfile.entity';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'comments' })
export class CommentEntity extends BaseEntity {
  @Column({ type: 'longtext', nullable: false })
  text: string;

  @ManyToOne(() => TaskEntity, (task) => task.comments, { onDelete: 'CASCADE' })
  task: TaskEntity;

  @OneToMany(() => CommentFileEntity, (commentFile) => commentFile.comment, {
    onDelete: 'CASCADE',
  })
  commentFiles: CommentFileEntity[];

  @ManyToOne(() => UserEntity, (user) => user.comments, { onDelete: 'CASCADE' })
  user: UserEntity;
}
