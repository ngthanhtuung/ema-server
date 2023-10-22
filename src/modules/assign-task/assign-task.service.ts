import { Injectable, BadRequestException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { AssignTaskEntity } from './assign-task.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { AssignTaskReq } from './dto/assign-task.request';
import {
  ASSIGN_ERROR_MESSAGE,
  TASK_ERROR_MESSAGE,
} from 'src/common/constants/constants';
import { TaskEntity } from '../task/task.entity';
import * as asyn from 'async';
@Injectable()
export class AssignTaskService extends BaseService<AssignTaskEntity> {
  constructor(
    @InjectRepository(AssignTaskEntity)
    private readonly assignTaskRepository: Repository<AssignTaskEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super(assignTaskRepository);
  }

  generalBuilderTask(): SelectQueryBuilder<AssignTaskEntity> {
    return this.assignTaskRepository.createQueryBuilder('assign-tasks');
  }

  async assignMemberToTask(data: AssignTaskReq, user: string): Promise<string> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      // eslint-disable-next-line prefer-const
      let { assignee, taskID, leader } = data;
      const oUser = JSON.parse(user);
      if (assignee.length < 0) {
        throw new BadRequestException(ASSIGN_ERROR_MESSAGE.NO_ASSIGNEE);
      }

      if (assignee.length > 0 && leader.length == 0) {
        leader = assignee[0];
      }

      const callback = async (queryRunner: QueryRunner): Promise<void> => {
        const taskExisted = await queryRunner.manager.findOne(TaskEntity, {
          where: { id: taskID },
        });

        if (!taskExisted) {
          throw new BadRequestException(TASK_ERROR_MESSAGE.TASK_NOT_FOUND);
        }
        const assignedExisted = await queryRunner.manager.find(
          AssignTaskEntity,
          {
            where: { taskID },
          },
        );
        const deleteAssignTask = assignedExisted?.map((item) => {
          queryRunner.manager.delete(AssignTaskEntity, { id: item.id });
        });
        if (deleteAssignTask.length !== 0) {
          await Promise.all(deleteAssignTask);
        }
        const aAssignTask = [];
        assignee.map((item) => {
          let isLeader = false;
          if (item === leader) {
            isLeader = true;
          }
          const oAssignTask = {
            taskID,
            assignee: item,
            isLeader,
            taskMaster: oUser.id,
          };
          aAssignTask.push(() => {
            queryRunner.manager.insert(AssignTaskEntity, oAssignTask);
          });
        });
        asyn.parallelLimit(aAssignTask, 3);
      };
      await this.transaction(callback, queryRunner);
      return 'Assign member successfully';
    } catch (err) {
      return err.message;
    }
  }
}
