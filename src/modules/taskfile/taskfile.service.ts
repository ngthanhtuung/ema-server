import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { TaskFileEntity } from './taskFile.entity';
import TaskFileRepository from './taskFile.repository';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { TaskFileCreateReq } from './dto/taskFile.request';
import { TaskService } from '../task/task.service';
import { Inject } from '@nestjs/common/decorators';
import { forwardRef } from '@nestjs/common/utils';
import { TaskEntity } from '../task/task.entity';
import { TASK_ERROR_MESSAGE } from 'src/common/constants/constants';

@Injectable()
export class TaskfileService extends BaseService<TaskFileEntity> {
  constructor(
    @InjectRepository(TaskFileEntity)
    private readonly taskFileRepository: TaskFileRepository,
    @InjectDataSource()
    private dataSource: DataSource,
    @Inject(forwardRef(() => TaskService))
    private taskService: TaskService,
  ) {
    super(taskFileRepository);
  }

  generalBuilderDivision(): SelectQueryBuilder<TaskFileEntity> {
    return this.taskFileRepository.createQueryBuilder('taskFile');
  }

  async insertTaskFile(data: TaskFileCreateReq): Promise<string> {
    const { taskID, fileUrl } = data;
    const queryRunner = this.dataSource.createQueryRunner();
    for (const key in data) {
      if (data[key].trim().length == 0) {
        throw new InternalServerErrorException(`${key} is empty`);
      }
    }
    const callback = async (queryRunner: QueryRunner): Promise<void> => {
      const taskExist = await queryRunner.manager.findOne(TaskEntity, {
        where: { id: taskID },
      });
      if (!taskExist) {
        throw new BadRequestException(TASK_ERROR_MESSAGE.TASK_NOT_FOUND);
      }
      await queryRunner.manager.insert(TaskFileEntity, { taskID, fileUrl });
    };
    await this.transaction(callback, queryRunner);
    return 'Insert fileUrl successfully';
  }
}
