import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { TaskEntity } from './task.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import TaskRepository from './task.repository';
import { DataSource, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { TaskCreateReq } from './dto/task.request';
import { TaskfileService } from 'src/modules/taskfile/taskFile.service';
import { Inject } from '@nestjs/common/decorators';
import { forwardRef } from '@nestjs/common/utils';
import { EventEntity } from '../event/event.entity';
import {
  EVENT_ERROR_MESSAGE,
  TASK_ERROR_MESSAGE,
} from 'src/common/constants/constants';
import { AssignTaskService } from '../assign-task/assign-task.service';

@Injectable()
export class TaskService extends BaseService<TaskEntity> {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: TaskRepository,
    @InjectDataSource()
    private dataSource: DataSource,
    private assignTaskService: AssignTaskService,
    @Inject(forwardRef(() => TaskfileService))
    private readonly taskFileService: TaskfileService,
  ) {
    super(taskRepository);
  }
  generalBuilderTask(): SelectQueryBuilder<TaskEntity> {
    return this.taskRepository.createQueryBuilder('tasks');
  }

  async getTaskInfo(condition: object): Promise<TaskEntity> {
    if (!condition['fieldName']) {
      throw new BadRequestException('Undefined field name!');
    }
    if (!condition['conValue']) {
      throw new BadRequestException('Undefined condition to get information!');
    }
    const fieldName = condition['fieldName'];
    const conValue = condition['conValue'];
    const whereCondition = {
      [fieldName]: conValue,
    };
    let results;
    try {
      results = await this.taskRepository.find({
        where: whereCondition,
        relations: { taskFiles: true, event: true },
      });
      if (!results || results.length == 0) {
        throw new BadRequestException('No tasks found');
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
    return results;
  }

  async createTask(task: TaskCreateReq, user: string): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    const {
      title,
      eventID,
      startDate,
      endDate,
      desc,
      priority,
      parentTask,
      estimationTime,
      effort,
      assignee,
      fileUrl,
      leader,
    } = task;
    const oUser = JSON.parse(user);
    const createBy = oUser.id;
    const callback = async (queryRunner: QueryRunner): Promise<void> => {
      const eventExisted = await queryRunner.manager.findOne(EventEntity, {
        where: { id: eventID },
      });

      if (!eventExisted) {
        throw new BadRequestException(EVENT_ERROR_MESSAGE.EVENT_NOT_FOUND);
      }

      const oNewTask = {
        createdBy: createBy,
        title,
        startDate,
        endDate,
        description: desc,
        parentTask,
        estimationTime,
        effort,
        priority,
        eventID,
      };
      const createTask = await queryRunner.manager.insert(TaskEntity, oNewTask);

      if (assignee.length > 0) {
        const oAssignTask = {
          assignee,
          taskID: createTask.generatedMaps[0]['id'],
          leader,
        };
        this.assignTaskService.assignMemberToTask(oAssignTask, user);
      }
      if (fileUrl) {
        this.taskFileService.insertTaskFile({
          taskID: createTask.generatedMaps[0]['id'],
          fileUrl,
        });
      }
    };
    await this.transaction(callback, queryRunner);

    return 'create task success';
  }

  async updateTask(taskID: string, data: object): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    for (const key in data) {
      if (data[key]?.trim().length == 0) {
        throw new InternalServerErrorException(`${key} is empty`);
      }
    }
    if (!taskID) {
      throw new InternalServerErrorException(`TaskID is empty`);
    }
    const callbacks = async (queryRunner: QueryRunner): Promise<void> => {
      const taskExist = await queryRunner.manager.findOne(TaskEntity, {
        where: { id: taskID },
      });
      if (!taskExist) {
        throw new BadRequestException(TASK_ERROR_MESSAGE.TASK_NOT_FOUND);
      }
      await queryRunner.manager.update(TaskEntity, { id: taskID }, data);
    };
    try {
      await this.transaction(callbacks, queryRunner);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return true;
  }
}
