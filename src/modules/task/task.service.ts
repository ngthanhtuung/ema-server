/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { TaskEntity } from './task.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import TaskRepository from './task.repository';
import { DataSource, QueryRunner } from 'typeorm';
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
import { UserPagination } from '../user/dto/user.request';
import * as moment from 'moment-timezone';
import { ETaskStatus, ETypeNotification } from 'src/common/enum/enum';
import { NotificationCreateRequest } from '../notification/dto/notification.request';
import { AssignTaskEntity } from '../assign-task/assign-task.entity';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { AppGateway } from 'src/sockets/app.gateway';
import { DeviceService } from '../device/device.service';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class TaskService extends BaseService<TaskEntity> {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: TaskRepository,
    @InjectDataSource()
    private dataSource: DataSource,
    private assignTaskService: AssignTaskService,
    private notificationService: NotificationService,
    private userService: UserService,
    @Inject(forwardRef(() => AppGateway))
    private readonly appGateWay: AppGateway,
    @Inject(forwardRef(() => TaskfileService))
    private readonly taskFileService: TaskfileService,
    private readonly deviceService: DeviceService,
  ) {
    super(taskRepository);
  }
  /**
   * getTaskInfo
   * @param condition
   * @returns
   */
  async getTaskInfo(
    condition: object,
    userPagination: UserPagination,
  ): Promise<TaskEntity> {
    if (!condition['fieldName']) {
      throw new BadRequestException('Undefined field name!');
    }
    if (!condition['conValue']) {
      throw new BadRequestException('Undefined condition to get information!');
    }
    const fieldName = condition['fieldName'];
    const conValue = condition['conValue'];
    const { sizePage, currentPage } = userPagination;
    const whereCondition = {
      [fieldName]: conValue,
      isTemplate: false,
    };
    let results;
    const offset = sizePage * (currentPage - 1);
    try {
      results = await this.taskRepository.find({
        where: whereCondition,
        skip: offset,
        take: sizePage,
        order: {
          assignTasks: { isLeader: 'DESC' },
        },
        select: {
          event: {
            id: true,
            eventName: true,
          },
          assignTasks: {
            id: true,
            isLeader: true,
            user: {
              id: true,
              profile: {
                profileId: true,
                avatar: true,
                fullName: true,
              },
            },
          },
          subTask: {
            id: true,
            createdAt: true,
            createdBy: true,
            updatedAt: true,
            title: true,
            startDate: true,
            endDate: true,
            description: true,
            priority: true,
            status: true,
            estimationTime: true,
            effort: true,
            modifiedBy: true,
            approvedBy: true,
            assignTasks: {
              id: true,
              isLeader: true,
              user: {
                id: true,
                profile: {
                  profileId: true,
                  avatar: true,
                  fullName: true,
                },
              },
            },
          },
          parent: {
            id: true,
            createdAt: true,
            createdBy: true,
            updatedAt: true,
            title: true,
            startDate: true,
            endDate: true,
            description: true,
            priority: true,
            status: true,
            estimationTime: true,
            effort: true,
            modifiedBy: true,
            approvedBy: true,
            assignTasks: {
              id: true,
              isLeader: true,
              user: {
                id: true,
                profile: {
                  profileId: true,
                  avatar: true,
                  fullName: true,
                },
              },
            },
          },
        },
        relations: {
          event: true,
          taskFiles: true,
          assignTasks: {
            user: {
              profile: true,
            },
          },
          subTask: {
            assignTasks: {
              user: {
                profile: true,
              },
            },
            taskFiles: true,
          },
          parent: {
            assignTasks: {
              user: {
                profile: true,
              },
            },
            taskFiles: true,
          },
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
   * getTemplateTaskInfo
   * @param condition
   * @param userPagination
   * @returns
   */
  async getTemplateTaskInfo(
    condition: object,
    userPagination: UserPagination,
  ): Promise<TaskEntity> {
    if (!condition['fieldName']) {
      throw new BadRequestException('Undefined field name!');
    }
    if (!condition['conValue']) {
      throw new BadRequestException('Undefined condition to get information!');
    }
    const fieldName = condition['fieldName'];
    const conValue = condition['conValue'];
    const { sizePage, currentPage } = userPagination;
    const whereCondition = {
      [fieldName]: conValue,
      isTemplate: true,
    };
    let results;
    const offset = sizePage * (currentPage - 1);
    try {
      results = await this.taskRepository.find({
        where: whereCondition,
        skip: offset,
        take: sizePage,
        order: {
          assignTasks: { isLeader: 'DESC' },
        },
        select: {
          event: {
            id: true,
            eventName: true,
          },
          assignTasks: {
            id: true,
            isLeader: true,
            user: {
              id: true,
              email: true,
              profile: {
                profileId: true,
                avatar: true,
                fullName: true,
              },
            },
          },
          subTask: {
            id: true,
            createdAt: true,
            createdBy: true,
            updatedAt: true,
            title: true,
            startDate: true,
            endDate: true,
            description: true,
            priority: true,
            status: true,
            estimationTime: true,
            effort: true,
            modifiedBy: true,
            approvedBy: true,
            assignTasks: {
              id: true,
              isLeader: true,
              user: {
                id: true,
                email: true,
                profile: {
                  profileId: true,
                  avatar: true,
                  fullName: true,
                },
              },
            },
          },
          parent: {
            id: true,
            createdAt: true,
            createdBy: true,
            updatedAt: true,
            title: true,
            startDate: true,
            endDate: true,
            description: true,
            priority: true,
            status: true,
            estimationTime: true,
            effort: true,
            modifiedBy: true,
            approvedBy: true,
            assignTasks: {
              id: true,
              isLeader: true,
              user: {
                id: true,
                email: true,
                profile: {
                  profileId: true,
                  avatar: true,
                  fullName: true,
                },
              },
            },
          },
        },
        relations: {
          event: true,
          taskFiles: true,
          assignTasks: {
            user: {
              profile: true,
            },
          },
          subTask: {
            assignTasks: {
              user: {
                profile: true,
              },
            },
            taskFiles: true,
          },
          parent: {
            assignTasks: {
              user: {
                profile: true,
              },
            },
            taskFiles: true,
          },
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
      file,
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
        startDate: moment(startDate).tz('Asia/Ho_Chi_Minh').toDate(),
        endDate: moment(endDate).tz('Asia/Ho_Chi_Minh').toDate(),
        description: desc,
        estimationTime: estimationTime,
        priority: priority,
        parent: {
          id: parentTask,
        },
      });

      if (assignee?.length > 0) {
        const oAssignTask = {
          assignee,
          taskID: createTask.generatedMaps[0]['id'],
          leader,
        };
        this.assignTaskService.assignMemberToTask(oAssignTask, user, task);
      }
      if (file) {
        for (let i = 0; i < file?.length; i++) {
          this.taskFileService.insertTaskFile({
            taskID: createTask.generatedMaps[0]['id'],
            fileName: file[0].fileName,
            fileUrl: file[0].fileUrl,
          });
        }
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
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async updateTask(taskID: string, data: object, oUser: any): Promise<boolean> {
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
      const listUser: any = await queryRunner.manager.find(AssignTaskEntity, {
        where: { taskID: taskID },
      });
      const taskExisted: any = await this.taskRepository.findOne({
        where: { id: taskID },
        select: {
          parent: {
            id: true,
          },
        },
        relations: {
          parent: true,
        },
      });
      const createNotification = [];
      const listAssigneeId = [];
      const listTaskMasterId = [];
      for (const item of listUser) {
        if (item?.assignee !== oUser?.id) {
          const dataNotification: NotificationCreateRequest = {
            title: `Công việc đã được cập nhât`,
            content: `${oUser.fullName} đã cập nhât công việc ${taskExisted?.title}`,
            readFlag: false,
            type: ETypeNotification.TASK,
            sender: oUser.id,
            userId: item?.assignee,
            eventId: taskExisted?.eventID,
            parentTaskId: taskExisted?.parent?.id,
            commonId: taskID,
          };
          listAssigneeId.push(item?.assignee);
          const socketId = (await this.userService.findById(item?.assignee))
            ?.socketId;
          const client = this.appGateWay.server;
          if (socketId !== null) {
            client.to(socketId).emit('notification', {
              ...dataNotification,
              avatar: oUser?.avatar,
            });
          }
          createNotification.push(
            this.notificationService.createNotification(dataNotification),
          );
        }
      }
      if (listAssigneeId.length !== 0) {
        const listAssigneeDeviceToken =
          await this.deviceService.getListDeviceTokens(listAssigneeId);
        await this.notificationService.pushNotificationFirebase(
          listAssigneeDeviceToken,
          `Công việc đã được cập nhât`,
          `${oUser.fullName} đã cập nhât công việc ${taskExisted?.title}`,
        );
      }
      // Notificaiton task master
      if (listUser?.[0].taskMaster !== oUser?.id) {
        const socketId = (
          await this.userService.findById(listUser?.[0].taskMaster)
        )?.socketId;
        const dataNotification: NotificationCreateRequest = {
          title: `Công việc đã được cập nhât`,
          content: `${oUser.fullName} đã cập nhât công việc ${taskExisted?.title}`,
          readFlag: false,
          type: ETypeNotification.TASK,
          sender: oUser.id,
          userId: listUser?.[0].taskMaster,
          eventId: taskExisted?.eventID,
          parentTaskId: taskExisted?.parent?.id,
          commonId: taskID,
        };
        const client = this.appGateWay.server;
        if (socketId !== null) {
          client.to(socketId).emit('notification', {
            ...dataNotification,
            avatar: oUser?.avatar,
          });
        }
        listTaskMasterId.push(listUser?.[0].taskMaster);
        if (listTaskMasterId?.length !== 0) {
          const listTaskMasterToken =
            await this.deviceService.getListDeviceTokens(listTaskMasterId);
          await this.notificationService.pushNotificationFirebase(
            listTaskMasterToken,
            `Công việc đã được cập nhât`,
            `${oUser.fullName} đã cập nhât công việc ${taskExisted?.title}`,
          );
        }
        createNotification.push(
          this.notificationService.createNotification(dataNotification),
        );
      }
      await Promise.all(createNotification);
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
    const { assignee, priority, sort, status, eventID } = filter;
    let result;
    try {
      result = await this.taskRepository.find({
        select: {
          assignTasks: {
            id: true,
            isLeader: true,
            user: {
              id: true,
              profile: {
                avatar: true,
                fullName: true,
              },
            },
          },
        },
        where: {
          priority,
          status,
          assignTasks: {
            assignee,
          },
          isTemplate: false,
          event: {
            id: eventID,
          },
        },
        relations: {
          subTask: true,
          parent: true,
          assignTasks: {
            user: {
              profile: true,
            },
          },
          taskFiles: true,
        },
        order: {
          createdAt: { direction: sort },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return result;
  }

  async findUserInTask(
    taskId: string,
    userId: string,
  ): Promise<boolean | undefined> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const query = await queryRunner.manager.query(`
      SELECT COUNT(*) as count
      FROM tasks
      INNER JOIN assign_tasks ON tasks.id = assign_tasks.taskId
      WHERE tasks.id = '${taskId}'
        AND (assign_tasks.assignee = '${userId}' OR assign_tasks.taskMaster = '${userId}')
      `);
      console.log(query[0].count);
      const result = query[0].count;
      // const result = await this.taskRepository.find({
      //   // where: [
      //   //   { assignTasks: { assignee: userId } },
      //   //   { assignTasks: { taskMaster: userId } },
      //   // ],
      //   where: [
      //     { id: taskId, assignTasks: { assignee: userId } },
      //     { id: taskId, assignTasks: { taskMaster: userId } },
      //   ],
      // });

      return result.length > 0 ? true : false;
    } catch (err) {
      return false;
    }
  }

  async getTaskStatistic(eventId: string): Promise<unknown> {
    try {
      const tasks = await this.taskRepository.find({
        where: {
          event: {
            id: eventId,
          },
        },
      });
      const taskStatistics = {
        total: tasks.length,
        pending: tasks.filter((task) => task.status === ETaskStatus.PENDING)
          .length,
        done: tasks.filter((task) => task.status === ETaskStatus.DONE).length,
        cancel: tasks.filter((task) => task.status === ETaskStatus.CANCEL)
          .length,
        overdue: tasks.filter((task) => task.status === ETaskStatus.OVERDUE)
          .length,
      };
      return taskStatistics;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  // async getNumOfPeopleInTaskStatistic(eventId: string): Promise<unknown> {
  //   try {
  //     const tasks = await this.taskRepository.find({
  //       where: {
  //         event: {
  //           id: eventId,
  //         },
  //       },
  //       relations: ['assignTasks'],
  //     });
  //     const uniqueTaskMasters = new Set();
  //     const uniqueLeaders = new Set();
  //     const uniqueMembers = new Set();
  //     const peopleStatistics = {
  //       leader: tasks.filter((task) =>
  //         task.assignTasks.some((assignTask) => assignTask.isLeader === true),
  //       ).length,
  //       member: tasks.filter((task) =>
  //         task.assignTasks.some((assignTask) => assignTask.isLeader === false),
  //       ).length,
  //       taskMaster: tasks.filter((task) =>
  //         task.assignTasks.some((assignTask) => {
  //           if (assignTask.taskMaster) {
  //             // Check if the taskMaster is not already counted
  //             if (!uniqueTaskMasters.has(assignTask.taskMaster)) {
  //               uniqueTaskMasters.add(assignTask.taskMaster);
  //               return true; // Include this taskMaster in the count
  //             }
  //           }
  //           return false; // Skip this taskMaster in the count
  //         }),
  //       ).length,
  //     };
  //     return peopleStatistics;
  //   } catch (err) {
  //     throw new InternalServerErrorException(err.message);
  //   }
  // }

  async getNumOfPeopleInTaskStatistic(eventId: string): Promise<unknown> {
    try {
      const tasks = await this.taskRepository.find({
        where: {
          event: {
            id: eventId,
          },
        },
        relations: ['assignTasks'],
      });

      const uniquePeople = {
        leaders: new Set<string>(),
        members: new Set<string>(),
        taskMasters: new Set<string>(),
      };

      const peopleStatistics = tasks.reduce(
        (stats, task) => {
          task.assignTasks.forEach((assignTask) => {
            if (
              assignTask.isLeader === true &&
              !uniquePeople.leaders.has(assignTask.id)
            ) {
              uniquePeople.leaders.add(assignTask.id);
              stats.leader += 1;
            } else if (
              assignTask.isLeader === false &&
              !uniquePeople.members.has(assignTask.id)
            ) {
              uniquePeople.members.add(assignTask.id);
              stats.member += 1;
            }

            if (
              assignTask.taskMaster &&
              !uniquePeople.taskMasters.has(assignTask.taskMaster)
            ) {
              uniquePeople.taskMasters.add(assignTask.taskMaster);
              stats.taskMaster += 1;
            }
          });

          return stats;
        },
        {
          leader: 0,
          member: 0,
          taskMaster: 0,
        },
      );

      return peopleStatistics;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async checkUserInTask(userId: string): Promise<boolean> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const query = await queryRunner.manager.query(`
      SELECT COUNT(*) as count
      FROM tasks
      INNER JOIN assign_tasks ON tasks.id = assign_tasks.taskId
      WHERE assign_tasks.assignee = '${userId}' AND (tasks.status IN ('PENDING', 'PROCESSING')) 
      `);
      const result = query[0].count;
      console.log(`User has task: ${result}`);
      return result > 0 ? true : false;
    } catch (err) {
      return false;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async autoUpdateTask(): Promise<void> {
    try {
      const currentDate = moment().tz('Asia/Ho_Chi_Minh').toDate();
      const tasks = await this.taskRepository.find({
        where: [
          { status: ETaskStatus.PENDING },
          { status: ETaskStatus.PROCESSING },
        ],
      });
      const overdueTasks = tasks.filter((task) => task.endDate <= currentDate);
      if (overdueTasks.length > 0) {
        await Promise.all(
          overdueTasks.map(async (task) => {
            task.status = ETaskStatus.OVERDUE;
            return await this.taskRepository.save(task);
          }),
        );
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
