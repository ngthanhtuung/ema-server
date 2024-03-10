/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  COMMENT_ERROR_MESSAGE,
  TASK_ERROR_MESSAGE,
} from './../../common/constants/constants';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CommentEntity } from './comment.entity';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import {
  CommentCreateRequest,
  CommentUpdateRequest,
} from './dto/comment.request';
import { TaskService } from '../task/task.service';
import { TaskEntity } from '../task/task.entity';
import { UserEntity } from '../user/user.entity';
import { CommentFileEntity } from '../commentfile/commentfile.entity';
import { ERole, ETypeNotification } from 'src/common/enum/enum';
import { CommentfileService } from '../commentfile/commentfile.service';
import * as moment from 'moment-timezone';
import { NotificationService } from '../notification/notification.service';
import { NotificationCreateRequest } from '../notification/dto/notification.request';

@Injectable()
export class CommentService extends BaseService<CommentEntity> {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    private readonly taskService: TaskService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly commentFileService: CommentfileService,
    private notificationService: NotificationService,
  ) {
    super(commentRepository);
  }

  async getCommentByTaskId(
    taskId: string,
  ): Promise<CommentEntity[] | undefined> {
    try {
      const task = await this.taskService.findOne({
        where: {
          id: taskId,
        },
      });
      if (!task) {
        throw new NotFoundException(TASK_ERROR_MESSAGE.TASK_NOT_FOUND);
      }

      const result = await this.commentRepository
        .createQueryBuilder('comment')
        .where('comment.task.id = :taskId', { taskId })
        .leftJoinAndSelect('comment.user', 'user')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('comment.commentFiles', 'commentFiles')
        .select([
          'comment.id',
          'comment.text',
          'comment.status',
          'comment.createdAt',
          'user.id',
          'user.email',
          'profile.fullName',
          'profile.avatar',
          'commentFiles.id',
          'commentFiles.fileName',
          'commentFiles.fileUrl',
        ])
        .andWhere('comment.status = :status', { status: true })
        .orderBy('comment.createdAt', 'ASC')
        .getMany();
      const finalData = result?.map((item: any) => {
        item.createdAt = moment(item.createdAt)
          .add(7, 'hours')
          .format('YYYY-MM-DD HH:mm:ss');
        return item;
      });
      return finalData;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async createComment(
    data: CommentCreateRequest,
    user: string,
  ): Promise<string | undefined> {
    try {
      const loginUser = JSON.parse(user);
      const queryRunner = this.dataSource.createQueryRunner();
      const userInTask = await this.taskService.findUserInTask(
        data.taskID,
        loginUser.id,
      );
      if (userInTask || loginUser.role === ERole.MANAGER) {
        const callback = async (queryRunner: QueryRunner): Promise<void> => {
          const task = await queryRunner.manager.findOne(TaskEntity, {
            where: {
              id: data.taskID,
            },
            select: {
              eventDivision: {
                id: true,
                event: {
                  id: true,
                },
              },
              assignTasks: true,
            },
            relations: {
              eventDivision: {
                event: true,
              },
              assignTasks: true,
            },
          });
          const taskMasterId = task?.assignTasks[0]?.taskMaster;
          let notificationType = ETypeNotification.COMMENT;
          if (task?.parentTask !== null) {
            notificationType = ETypeNotification.COMMENT_SUBTASK;
          }
          const user = await queryRunner.manager.findOne(UserEntity, {
            where: {
              id: loginUser.id,
            },
          });
          const createdComment = await queryRunner.manager.insert(
            CommentEntity,
            {
              text: data.content,
              task: task,
              user: user,
            },
          );
          const assigne = task?.assignTasks?.map((item) => item?.assignee);
          console.log('assigne:', assigne);

          if (data.file !== undefined) {
            for (let i = 0; i < data.file.length; i++) {
              await queryRunner.manager.insert(CommentFileEntity, {
                comment: createdComment.identifiers[0],
                fileName: data.file[i].fileName,
                fileUrl: data.file[i].fileUrl,
              });
            }
          }
          // Send Notification
          const dataNotification: NotificationCreateRequest = {
            title: `Đã có một comment mới `,
            content: `${loginUser.fullName} đã comment vào ${task?.title}`,
            type: notificationType,
            userIdAssignee: assigne,
            // userIdTaskMaster: [loginUser?.id],
            userIdTaskMaster: [taskMasterId],
            eventID: task?.eventDivision?.event?.id,
            parentTaskId: task?.parentTask || task?.parent?.id,
            commonId: data.taskID,
            avatar: loginUser?.avatar,
            messageSocket: 'notification',
          };

          console.log('Data notification: ', dataNotification);
          await this.notificationService.createNotification(
            dataNotification,
            loginUser?.id,
            queryRunner,
          );
        };
        await this.transaction(callback, queryRunner);
        return 'Comment successfully';
      }
      throw new BadRequestException(COMMENT_ERROR_MESSAGE.COMMENT_DENIED);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateComment(
    userId: string,
    commentId: string,
    data: CommentUpdateRequest,
  ): Promise<string> {
    try {
      const commentExisted = await this.commentRepository.findOne({
        where: {
          id: commentId,
          user: {
            id: userId,
          },
        },
      });
      console.log('Comment existed: ', commentExisted);
      if (commentExisted) {
        await this.commentRepository.update(
          { id: commentId },
          {
            text: data.content,
          },
        );
        await this.commentFileService.updateCommentFile(commentId, data.file);
        return 'Update comment successfully';
      } else {
        throw new BadRequestException(
          `${COMMENT_ERROR_MESSAGE.COMMENT_NOT_FOUND} or ${COMMENT_ERROR_MESSAGE.COMMENT_DENIED}`,
        );
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteComment(
    commentId: string,
    user: string,
  ): Promise<string | undefined> {
    try {
      const loginUser = JSON.parse(user);
      const commentExisted = await this.commentRepository.findOne({
        where: {
          user: {
            id: loginUser.id,
          },
        },
      });
      if (commentExisted || loginUser.role === ERole.MANAGER) {
        await this.commentRepository.update(commentId, {
          status: false,
        });
        return 'Delete comment succesfully';
      }
      throw new BadRequestException(
        COMMENT_ERROR_MESSAGE.DELETE_COMMENT_DENIED,
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
