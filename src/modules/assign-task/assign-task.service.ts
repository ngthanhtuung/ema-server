/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  Inject,
  forwardRef,
  InternalServerErrorException,
} from '@nestjs/common';
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
import { NotificationCreateRequest } from '../notification/dto/notification.request';
import { ETypeNotification } from 'src/common/enum/enum';
import { NotificationService } from '../notification/notification.service';
import { TaskEntity } from '../task/task.entity';

@Injectable()
export class AssignTaskService extends BaseService<AssignTaskEntity> {
  constructor(
    @InjectRepository(AssignTaskEntity)
    private readonly assignTaskRepository: Repository<AssignTaskEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
    private notificationService: NotificationService,
  ) {
    super(assignTaskRepository);
  }

  generalBuilderTask(): SelectQueryBuilder<AssignTaskEntity> {
    return this.assignTaskRepository.createQueryBuilder('assign-tasks');
  }

  async assignMemberToTask(
    data: AssignTaskReq,
    user: string,
    task?: any,
    queryRunner?: QueryRunner,
  ): Promise<string> {
    let shouldReleaseQueryRunner = false;
    try {
      const { assignee, taskID } = data;
      let { leader } = data;
      const oUser = JSON.parse(user);
      if (!queryRunner) {
        queryRunner = this.dataSource.createQueryRunner();
        shouldReleaseQueryRunner = true; // Mark to release query runner at the end
      }
      if (task == undefined) {
        const taskExisted: any = await queryRunner.manager.findOne(TaskEntity, {
          where: { id: taskID },
          select: {
            parent: {
              id: true,
            },
            eventDivision: {
              id: true,
              event: {
                id: true,
              },
            },
          },
          relations: {
            parent: true,
            eventDivision: {
              event: true,
            },
          },
        });
        task = taskExisted;
      }
      console.log('task:', task);
      console.log('eventID:', task?.eventDivision?.event?.id);
      if (assignee?.length > 0 && leader?.length == 0) {
        leader = assignee[0];
      }
      // Delete all existing assigned tasks for the given task ID.
      await queryRunner.manager.query(
        `DELETE FROM assign_tasks WHERE taskID = '${task}'`,
      );

      // Insert the new assigned tasks.
      // const assigneePromises = assignee.map((assignee) => {
      //   const isLeader = assignee === leader;
      //   const assignTask = {
      //     taskID: taskID,
      //     assignee: assignee,
      //     isLeader: isLeader,
      //     taskMaster: oUser?.id,
      //   };
      //   return this.assignTaskRepository.save(assignTask);
      // });
      // await Promise.all(assigneePromises);
      await Promise.all(
        assignee.map((assignee) => {
          const isLeader = assignee === leader;
          const assignTask = {
            taskID: taskID,
            assignee: assignee,
            isLeader: isLeader,
            taskMaster: oUser?.id,
          };
          // return this.assignTaskRepository.save(assignTask);
          return queryRunner.manager.insert(AssignTaskEntity, assignTask);
        }),
      );
      // Send Notification
      const dataNotification: NotificationCreateRequest = {
        title: `Công việc được giao`,
        content: `${oUser.fullName} đã giao công việc ${task?.title}`,
        type: ETypeNotification.TASK,
        userIdAssignee: assignee,
        userIdTaskMaster: [oUser?.id],
        eventID: task?.eventID || task?.eventDivision?.event?.id,
        parentTaskId: task?.parentTask || task?.parent?.id,
        commonId: taskID,
        avatar: oUser?.avatar,
        messageSocket: 'notification',
      };
      await this.notificationService.createNotification(
        dataNotification,
        oUser?.id,
        queryRunner,
      );
      return 'Assign member successfully';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    } finally {
      if (shouldReleaseQueryRunner && queryRunner) {
        await queryRunner.release(); // Release the query runner if it was created in this function
      }
    }
  }
}
