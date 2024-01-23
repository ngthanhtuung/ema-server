/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Inject, forwardRef } from '@nestjs/common';
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
import { UserService } from '../user/user.service';
import { AppGateway } from 'src/sockets/app.gateway';
import { TaskCreateReq } from '../task/dto/task.request';
import { TaskEntity } from '../task/task.entity';
import { DeviceService } from '../device/device.service';
@Injectable()
export class AssignTaskService extends BaseService<AssignTaskEntity> {
  constructor(
    @InjectRepository(AssignTaskEntity)
    private readonly assignTaskRepository: Repository<AssignTaskEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
    private notificationService: NotificationService,
    private userService: UserService,
    @Inject(forwardRef(() => AppGateway))
    private readonly appGateWay: AppGateway,
    private deviceService: DeviceService,
  ) {
    super(assignTaskRepository);
  }

  generalBuilderTask(): SelectQueryBuilder<AssignTaskEntity> {
    return this.assignTaskRepository.createQueryBuilder('assign-tasks');
  }

  // async assignMemberToTask(
  //   data: AssignTaskReq,
  //   user: string,
  //   task?: any,
  // ): Promise<string> {
  //   const { assignee, taskID } = data;
  //   let { leader } = data;
  //   const oUser = JSON.parse(user);
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   if (task == undefined) {
  //     const taskExisted: any = await queryRunner.manager.findOne(TaskEntity, {
  //       where: { id: taskID },
  //       select: {
  //         parent: {
  //           id: true,
  //         },
  //       },
  //       relations: {
  //         parent: true,
  //       },
  //     });
  //     task = taskExisted;
  //   }
  //   console.log('task:', task);

  //   const callback = async (queryRunner: QueryRunner): Promise<void> => {
  //     if (assignee?.length > 0 && leader?.length == 0) {
  //       leader = assignee[0];
  //     }
  //     // Delete all existing assigned tasks for the given task ID.
  //     await queryRunner.manager.query(
  //       `DELETE FROM assign_tasks WHERE taskID = '${taskID}'`,
  //     );

  //     // Insert the new assigned tasks.
  //     await Promise.all(
  //       assignee.map((assignee) => {
  //         const isLeader = assignee === leader;
  //         const assignTask = {
  //           taskID: taskID,
  //           assignee: assignee,
  //           isLeader: isLeader,
  //           taskMaster: oUser.id,
  //         };

  //         return queryRunner.manager.insert(AssignTaskEntity, assignTask);
  //       }),
  //     );
  //   };
  //   await this.transaction(callback, queryRunner);
  //   const createNotification = [];
  //   for (let index = 0; index < assignee.length; index++) {
  //     const idUser = assignee[index];
  //     const dataNotification: NotificationCreateRequest = {
  //       title: `Công việc được giao`,
  //       content: `${oUser.fullName} đã giao công việc ${task?.title}`,
  //       readFlag: false,
  //       type: ETypeNotification.TASK,
  //       sender: oUser.id,
  //       userId: idUser,
  //       eventId: task?.eventID,
  //       parentTaskId: task?.parentTask || task?.parent?.id,
  //       commonId: taskID,
  //     };
  //     const socketId = (await this.userService.findById(idUser))?.socketId;
  //     const client = this.appGateWay.server;
  //     if (socketId !== null) {
  //       client.to(socketId).emit('notification', {
  //         ...dataNotification,
  //         avatar: oUser?.avatar,
  //       });
  //     }
  //     createNotification.push(
  //       this.notificationService.createNotification(dataNotification),
  //     );
  //   }
  //   const listOfDeviceTokens = await this.deviceService.getListDeviceTokens(
  //     assignee,
  //   );
  //   await this.notificationService.pushNotificationFirebase(
  //     listOfDeviceTokens,
  //     'Công việc được giao',
  //     `${oUser.fullName} đã giao công việc ${task?.title}`,
  //   );
  //   await Promise.all(createNotification);
  //   return 'Assign member successfully';
  // }
}
