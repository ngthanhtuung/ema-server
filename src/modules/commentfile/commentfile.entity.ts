import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { CommentEntity } from '../comment/comment.entity';

@Entity({ name: 'comment_files' })
export class CommentFileEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  fileType: string;

  @Column({ type: 'varchar', nullable: false })
  fileUrl: string;

  @ManyToOne(() => CommentEntity, (comment) => comment.commentFiles, {
    onDelete: 'CASCADE',
  })
  comment: CommentEntity;
}
