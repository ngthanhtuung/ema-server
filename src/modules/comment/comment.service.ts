import { COMMENT_ERROR_MESSAGE, TASK_ERROR_MESSAGE } from './../../common/constants/constants';
import { messaging } from 'firebase-admin';
import { BadGatewayException, BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CommentEntity } from './comment.entity';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOneOptions, QueryRunner } from 'typeorm';
import { CommentCreateRequest } from './dto/comment.request';
import { TaskService } from '../task/task.service';
import { TaskEntity } from '../task/task.entity';
import { UserEntity } from '../user/user.entity';
import { CommentFileEntity } from '../commentfile/commentfile.entity';
import { ERole } from 'src/common/enum/enum';

@Injectable()
export class CommentService extends BaseService<CommentEntity>{

    constructor(
        @InjectRepository(CommentEntity)
        private readonly commentRepository: Repository<CommentEntity>,
        private readonly taskService: TaskService,
        @InjectDataSource()
        private readonly dataSource: DataSource

    ) {
        super(commentRepository)
    }

    async getCommentByTaskId(
        taskId: string,
    ): Promise<CommentEntity[] | undefined> {
        try {
            const task = await this.taskService.findOne({
                where: {
                    id: taskId,
                },
            })
            if (!task) {
                throw new NotFoundException(TASK_ERROR_MESSAGE.TASK_NOT_FOUND)
            }

            const result = await this.commentRepository
                .createQueryBuilder('comment')
                .where('comment.task.id = :taskId', { taskId })
                .leftJoinAndSelect('comment.user', 'user')
                .leftJoinAndSelect('comment.commentFiles', 'commentFiles')
                .select([
                    'comment.id',
                    'comment.text',
                    'comment.status',
                    'comment.createdAt',
                    'user.id',
                    'user.email',
                    'user.email',
                    'commentFiles.id',
                    'commentFiles.fileUrl',
                ])
                .andWhere('comment.status = :status', { status: true })
                .orderBy('comment.createdAt', 'ASC')
                .getMany();
            return result;
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }


    async createComment(
        data: CommentCreateRequest,
        user: string
    ): Promise<string | undefined> {
        try {
            const loginUser = JSON.parse(user);
            const queryRunner = this.dataSource.createQueryRunner();
            const userInTask = await this.taskService.findUserInTask(loginUser.id);
            if (userInTask || loginUser.role === ERole.MANAGER) {
                const callback = async (queryRunner: QueryRunner): Promise<void> => {
                    const task = await queryRunner.manager.findOne(TaskEntity, {
                        where: {
                            id: data.taskID
                        }
                    })
                    const user = await queryRunner.manager.findOne(UserEntity, {
                        where: {
                            id: loginUser.id
                        }
                    })
                    const createdComment = await queryRunner.manager.insert(CommentEntity, {
                        text: data.content,
                        task: task,
                        user: user
                    })
                    if (data.fileUrl !== undefined) {
                        for (let i = 0; i < data.fileUrl.length; i++) {
                            const commentFile = await queryRunner.manager.insert(CommentFileEntity, {
                                comment: createdComment.identifiers[0],
                                fileUrl: data.fileUrl[i]
                            })
                        }
                    }
                }
                await this.transaction(callback, queryRunner);
                return 'Comment successfully'
            }
            throw new BadRequestException(COMMENT_ERROR_MESSAGE.COMMENT_DENIED)
        } catch (err) {
            throw new InternalServerErrorException(err.message)
        }
    }

    async deleteComment(
        commentId: string,
        user: string
    ): Promise<string | undefined> {
        try {
            const loginUser = JSON.parse(user);
            const commentExisted = await this.commentRepository.findOne({
                where: {
                    user: {
                        id: loginUser.id
                    }
                }
            })
            if (commentExisted || loginUser.role === ERole.MANAGER) {
                await this.commentRepository.update(commentId, {
                    status: false
                })
                return 'Delete comment succesfully'
            }
            throw new BadRequestException(COMMENT_ERROR_MESSAGE.DELETE_COMMENT_DENIED)
        } catch (err) {
            throw new InternalServerErrorException(err.message)
        }
    }

}
