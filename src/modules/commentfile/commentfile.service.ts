import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { CommentFileEntity } from './commentfile.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { CommentFileRequest } from './dto/commentFile.request';
import { CommentEntity } from '../comment/comment.entity';
import { COMMENT_ERROR_MESSAGE } from 'src/common/constants/constants';

@Injectable()
export class CommentfileService extends BaseService<CommentFileEntity> {
  constructor(
    @InjectRepository(CommentFileEntity)
    private readonly commentFileRepository: Repository<CommentFileEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super(commentFileRepository);
  }

  generalBuilderDivision(): SelectQueryBuilder<CommentFileEntity> {
    return this.commentFileRepository.createQueryBuilder('commentFile');
  }

  async updateCommentFile(
    commentId: string,
    commentFiles: CommentFileRequest[],
  ): Promise<string> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const callback = async (queryRunner: QueryRunner): Promise<void> => {
        const commentExist = await queryRunner.manager.findOne(CommentEntity, {
          where: { id: commentId },
        });
        if (!commentExist) {
          throw new NotFoundException(COMMENT_ERROR_MESSAGE.COMMENT_NOT_FOUND);
        }
        await queryRunner.manager.delete(CommentFileEntity, {
          commentID: commentId,
        });
        const insertPromises = commentFiles.map((commentFile) => {
          queryRunner.manager.insert(CommentFileEntity, {
            commentID: commentId,
            fileName: commentFile.fileName,
            fileUrl: commentFile.fileUrl,
          });
        });
        await Promise.all(insertPromises);
      };
      await this.transaction(callback, queryRunner);
      return 'Update comment file successfully';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
