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
import { FilterTask, TaskCreateReq } from './dto/task.request';
import { TaskfileService } from '../taskfile/taskfile.service';
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

  /**
   * getTaskInfo
   * @param condition
   * @returns
   */
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
        relations: {
          taskFiles: true,
          // event: true,
          subTask: true,
          parent: true,
        },
      });
      if ((!results || results.length == 0) && fieldName !== 'eventID') {
        throw new BadRequestException('No tasks found');
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
    return results;
  }

  /**
   * createTask
   * @param task
   * @param user
   * @returns
   */
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

      const createTask = await queryRunner.manager.insert(TaskEntity, {
        title: title,
        createdBy: createBy,
        eventID: eventID,
        startDate: startDate,
        endDate: endDate,
        description: desc,
        estimationTime: estimationTime,
        priority: priority,
        parent: {
          id: parentTask,
        },
      });

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

  /**
   * updateTask
   * @param taskID
   * @param data
   * @returns
   */
  async updateTask(taskID: string, data: object): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
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

  /**
   * filterTaskByAssignee
   * @param filter
   * @returns
   */
  async filterTaskByAssignee(filter: FilterTask): Promise<TaskEntity> {
    const { assignee, priority, sort, status } = filter;
    let result;
    try {
      result = await this.taskRepository.find({
        where: {
          priority,
          status,
          assignTasks: {
            assignee,
          },
        },
        relations: {
          event: true,
          taskFiles: true,
        },
        order: {
          endDate: { direction: sort },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return result;
  }
}
