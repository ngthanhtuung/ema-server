import { messaging } from 'firebase-admin';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CommentEntity } from './comment.entity';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOneOptions, QueryRunner } from 'typeorm';
import { CommentCreateRequest } from './dto/comment.request';
import { TaskService } from '../task/task.service';
import { TaskEntity } from '../task/task.entity';

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

    async createComment(
        data: CommentCreateRequest,
        user: string
    ): Promise<string | undefined> {
        try {
            const loginUser = JSON.parse(user);
            const queryRunner = this.dataSource.createQueryRunner();
            const userInTask = await this.taskService.findUserInTask(loginUser.id);
            if (userInTask) {

                const callback = async (queryRunner: QueryRunner): Promise<void> => {
                    const task = await queryRunner.manager.findOne(TaskEntity, {

                    })
                }
            }
            return 'Comment successfully'
        } catch (err) {
            throw new InternalServerErrorException(err.message)
        }
    }
}
