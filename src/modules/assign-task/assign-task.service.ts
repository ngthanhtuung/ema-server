/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
import { EStatusAssignee, ETypeNotification } from 'src/common/enum/enum';
import { NotificationService } from '../notification/notification.service';
import { TaskEntity } from '../task/task.entity';
import * as moment from 'moment-timezone';
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
      console.log('eventID:', task?.eventDivision?.event?.id);
      if (assignee?.length > 0 && leader?.length == 0) {
        leader = assignee[0];
      }
      const taskIDCommon = task?.id || taskID;
      console.log('taskIDCommon:', taskIDCommon);
      const getAllListAssignee = await queryRunner.manager.find(
        AssignTaskEntity,
        {
          where: {
            taskID: taskIDCommon,
          },
        },
      );
      const listNewAssignee = [...assignee];
      const listUserReplace = getAllListAssignee.reduce(
        (listUserReplace, item) => {
          if (!listNewAssignee.includes(item?.assignee)) {
            listUserReplace.push(item?.assignee);
          } else {
            const indexNewMember = listNewAssignee.indexOf(item?.assignee);
            if (
              listNewAssignee.includes(item?.assignee) &&
              indexNewMember > -1
            ) {
              listNewAssignee.splice(indexNewMember, 1);
            }
          }
          return listUserReplace;
        },
        [],
      );
      const listRemainingEmployeeNew = assignee.filter(
        (item) => !listNewAssignee.includes(item),
      );
      console.log(
        'getAllListAssignee:',
        getAllListAssignee.map((item) => item.assignee),
      );
      console.log('listUserReplace:', listUserReplace);
      console.log('listNewAssignee:', listNewAssignee);
      console.log('assignee:', assignee);
      console.log('listRemainingEmployeeNew:', listRemainingEmployeeNew);
      // Update status employee replace
      const listReplace = listUserReplace.map((assignee) => {
        const isLeader = assignee === leader;
        return queryRunner.manager.update(
          AssignTaskEntity,
          { assignee },
          {
            status: EStatusAssignee.INACTIVE,
            isLeader: isLeader,
            updatedAt: moment()
              .tz('Asia/Bangkok')
              .format('YYYY-MM-DD HH:mm:ss'),
          },
        );
      });
      // Update isLeader if change Leader
      const listRemainingAssignee = listRemainingEmployeeNew.map((assignee) => {
        const isLeader = assignee === leader;
        return queryRunner.manager.update(
          AssignTaskEntity,
          { assignee },
          { isLeader: isLeader, status: EStatusAssignee.ACTIVE },
        );
      });
      // Update status employee replace
      const listAssignee = listNewAssignee.map((assignee) => {
        const isLeader = assignee === leader;
        const assignTask = {
          taskID: taskIDCommon,
          assignee: assignee,
          isLeader: isLeader,
          taskMaster: oUser?.id,
          createdAt: moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
        };
        return queryRunner.manager.insert(AssignTaskEntity, assignTask);
      });
      await Promise.all([
        ...listReplace,
        ...listAssignee,
        ...listRemainingAssignee,
      ]);
      // Send Notification
      const dataNotification: NotificationCreateRequest = {
        title: `Công việc được giao`,
        content: `${oUser.fullName} đã giao công việc ${task?.title}`,
        type: ETypeNotification.TASK,
        userIdAssignee: assignee,
        userIdTaskMaster: [oUser?.id],
        eventID: task?.eventID || task?.eventDivision?.event?.id,
        parentTaskId: task?.parentTask || task?.parent?.id,
        commonId: taskIDCommon,
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
