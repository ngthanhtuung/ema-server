import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { CommentEntity } from '../comment/comment.entity';

@Entity({ name: 'comment_files' })
export class CommentFileEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  fileName: string;

  @Column({ type: 'text', nullable: false })
  fileUrl: string;

  @Column({ type: 'varchar', nullable: true })
  commentID: string;

  @ManyToOne(() => CommentEntity, (comment) => comment.commentFiles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'commentID', referencedColumnName: 'id' })
  comment: CommentEntity;
}
