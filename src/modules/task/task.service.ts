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
import {
  EPriority,
  ETaskStatus,
  ETypeNotification,
} from 'src/common/enum/enum';
import { NotificationCreateRequest } from '../notification/dto/notification.request';
import { AssignTaskEntity } from '../assign-task/assign-task.entity';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AssignEventService } from '../assign-event/assign-event.service';
import { TaskFileEntity } from '../taskfile/taskfile.entity';

@Injectable()
export class TaskService extends BaseService<TaskEntity> {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: TaskRepository,
    @InjectDataSource()
    private dataSource: DataSource,
    private assignTaskService: AssignTaskService,
    private assignEventService: AssignEventService,
    private userService: UserService,
    private notificationService: NotificationService,
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
    let fieldName = condition['fieldName'];
    const conValue = condition['conValue'];
    const { sizePage, currentPage } = userPagination;
    let listConditions = [
      {
        [fieldName]:
          fieldName === 'isTemplate' ? /^true$/i.test(conValue) : conValue,
      },
    ];
    if (fieldName === 'eventID') {
      fieldName = 'eventDivision';
      const listIdEventDivision: any =
        await this.assignEventService.getListIdEventDivision(conValue);
      console.log('listIdEventDivison:', listIdEventDivision);
      listConditions = listIdEventDivision.map((item) => {
        return {
          [fieldName]: {
            id: item?.id,
          },
        };
      });
    }
    let results;
    const offset = sizePage * (currentPage - 1);
    try {
      const arrayPromise = listConditions.map((whereCondition) => {
        return this.taskRepository.find({
          where: whereCondition,
          skip: offset,
          take: sizePage,
          order: {
            createdAt: 'DESC',
            assignTasks: { isLeader: 'DESC' },
          },
          select: {
            assignTasks: {
              id: true,
              isLeader: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              user: {
                id: true,
                email: true,
                profile: {
                  avatar: true,
                  fullName: true,
                },
              },
            },
            eventDivision: {
              id: true,
              event: {
                id: true,
                eventName: true,
              },
            },
            subTask: {
              id: true,
              // createdAt: true,
              createdBy: true,
              // updatedAt: true,
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
                status: true,
                createdAt: true,
                updatedAt: true,
                user: {
                  id: true,
                  email: true,
                  profile: {
                    avatar: true,
                    fullName: true,
                  },
                },
              },
              eventDivision: {
                id: true,
                event: {
                  id: true,
                  eventName: true,
                },
              },
            },
            parent: {
              id: true,
              // createdAt: true,
              createdBy: true,
              // updatedAt: true,
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
                status: true,
                createdAt: true,
                updatedAt: true,
                user: {
                  id: true,
                  email: true,
                  profile: {
                    avatar: true,
                    fullName: true,
                  },
                },
              },
              eventDivision: {
                id: true,
                event: {
                  id: true,
                  eventName: true,
                },
              },
            },
          },
          relations: {
            // event: true,
            taskFiles: true,
            assignTasks: {
              user: {
                profile: true,
              },
            },
            eventDivision: {
              event: true,
            },
            subTask: {
              assignTasks: {
                user: {
                  profile: true,
                },
              },
              eventDivision: {
                event: true,
              },
              taskFiles: true,
            },
            parent: {
              assignTasks: {
                user: {
                  profile: true,
                },
              },
              eventDivision: {
                event: true,
              },
              taskFiles: true,
            },
          },
        });
      });
      console.log('arrayPromise:', arrayPromise);
      const currentDate = moment();
      const mapPriory = {
        [EPriority.HIGH]: 1,
        [EPriority.MEDIUM]: 2,
        [EPriority.LOW]: 3,
      };
      results = await Promise.all(arrayPromise);
      results = results
        .flatMap((arr) => arr)
        .sort((a, b) => {
          const diffA = moment(a.startDate).diff(currentDate);
          const diffB = moment(b.startDate).diff(currentDate);
          if (diffA === diffB) {
            return mapPriory[`${a.priority}`] - mapPriory[`${b.priority}`];
          }
          if (diffB > diffA) {
            return -1;
          }
        });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
    return results;
  }

  /**
   * getListTaskInfoByDateOfUser
   * @param condition
   * @returns
   */
  async getListTaskInfoByDateOfUser(condition: object): Promise<TaskEntity> {
    const userId = condition['userId'];
    const date = condition['date'];
    const dateEnd = condition?.['dateEnd'];
    console.log('dateEnd:', dateEnd);

    let results;
    try {
      results = await this.taskRepository.find({
        where: {
          assignTasks: {
            user: {
              id: userId,
            },
          },
        },
        order: {
          priority: 'DESC',
          assignTasks: { isLeader: 'DESC' },
        },
        select: {
          assignTasks: {
            id: true,
            isLeader: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            user: {
              id: true,
              email: true,
              profile: {
                avatar: true,
                fullName: true,
              },
            },
          },
          eventDivision: {
            id: true,
            event: {
              id: true,
              eventName: true,
            },
          },
          subTask: {
            id: true,
            // createdAt: true,
            createdBy: true,
            // updatedAt: true,
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
              status: true,
              createdAt: true,
              updatedAt: true,
              user: {
                id: true,
                email: true,
                profile: {
                  avatar: true,
                  fullName: true,
                },
              },
            },
            eventDivision: {
              id: true,
              event: {
                id: true,
                eventName: true,
              },
            },
          },
          parent: {
            id: true,
            // createdAt: true,
            createdBy: true,
            // updatedAt: true,
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
              status: true,
              createdAt: true,
              updatedAt: true,
              user: {
                id: true,
                email: true,
                profile: {
                  avatar: true,
                  fullName: true,
                },
              },
            },
            eventDivision: {
              id: true,
              event: {
                id: true,
                eventName: true,
              },
            },
          },
        },
        relations: {
          taskFiles: true,
          assignTasks: {
            user: {
              profile: true,
            },
          },
          eventDivision: {
            event: true,
          },
          subTask: {
            assignTasks: {
              user: {
                profile: true,
              },
            },
            taskFiles: true,
            eventDivision: {
              event: true,
            },
          },
          parent: {
            assignTasks: {
              user: {
                profile: true,
              },
            },
            taskFiles: true,
            eventDivision: {
              event: true,
            },
          },
        },
      });
      console.log('result:', results);
      console.log('result.length:', results.length);
      results = results.filter((item) => {
        const startDateFormat = moment(item?.startDate).format('YYYY-MM-DD');
        console.log('startDateFormat:', startDateFormat);
        console.log('Date:', date);
        const endDateFormat = moment(item?.endDate).format('YYYY-MM-DD');
        console.log('endDateFormat:', endDateFormat);
        console.log('DateEnd:', dateEnd);
        if (dateEnd) {
          const checkStartDate = Boolean(
            startDateFormat >= date && startDateFormat <= dateEnd,
          );
          console.log('checkStartDate:', checkStartDate);

          const checkEndDate = Boolean(
            endDateFormat >= date && endDateFormat <= dateEnd,
          );
          console.log('checkEndDate:', checkEndDate);

          if (checkStartDate && checkEndDate) {
            return item;
          }
        } else {
          const formatDate = moment(date).format('YYYY-MM-DD');
          const checkDate = moment(formatDate).isBetween(
            moment(startDateFormat),
            moment(endDateFormat),
            'dates',
            '[]',
          );
          if (checkDate) {
            return item;
          }
        }
      });
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
      isTemplate,
    } = task;
    const oUser = JSON.parse(user);
    const createBy = oUser.id;
    let createTaskId;
    const callback = async (queryRunner: QueryRunner): Promise<void> => {
      const eventExisted = await queryRunner.manager.findOne(EventEntity, {
        where: { id: eventID },
      });

      if (!eventExisted) {
        throw new BadRequestException(EVENT_ERROR_MESSAGE.EVENT_NOT_FOUND);
      }

      const divisionId = (await this.userService.findById(assignee[0]))
        ?.divisionId;
      // console.log('divisionId:', divisionId);

      const listIdEventDivison =
        await this.assignEventService.getListIdEventDivision(
          eventID,
          divisionId,
        );
      // console.log('listIdEventDivison:', listIdEventDivison);
      const createTask = await queryRunner.manager.insert(TaskEntity, {
        title: title,
        createdBy: createBy,
        eventDivision: {
          id: listIdEventDivison?.[0]?.id,
        },
        startDate: startDate
          ? moment(startDate).tz('Asia/Bangkok').toDate()
          : undefined,
        endDate: endDate
          ? moment(endDate).tz('Asia/Bangkok').toDate()
          : undefined,
        description: desc,
        estimationTime: estimationTime,
        priority: priority,
        parent: {
          id: parentTask,
        },
        isTemplate: isTemplate,
      });
      createTaskId = createTask?.generatedMaps?.[0]?.['id'];
      // If task have file
      if (file) {
        for (const itemFile of file) {
          await queryRunner.manager.insert(TaskFileEntity, {
            taskID: createTask?.generatedMaps?.[0]?.['id'],
            fileName: itemFile?.fileName,
            fileUrl: itemFile?.fileUrl,
          });
        }
      }
      if (assignee?.length > 0) {
        const oAssignTask = {
          assignee,
          taskID: createTask?.generatedMaps?.[0]?.['id'],
          leader,
        };
        await this.assignTaskService.assignMemberToTask(
          oAssignTask,
          user,
          task,
          queryRunner,
        );
      }
    };
    await this.transaction(callback, queryRunner);
    return 'Create task success';
  }

  /**
   * updateTask
   * @param taskID
   * @param data
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async updateTask(taskID: string, data: object, oUser: any): Promise<boolean> {
    let eventID = data['eventID'] || undefined;
    delete data['eventID'];
    const queryRunner = this.dataSource.createQueryRunner();
    if (!taskID) {
      throw new InternalServerErrorException(`TaskID is empty`);
    }
    try {
      const taskExist = await queryRunner.manager.findOne(TaskEntity, {
        where: { id: taskID },
        select: {
          eventDivision: {
            id: true,
          },
        },
        relations: {
          eventDivision: true,
        },
      });
      if (!taskExist) {
        throw new BadRequestException(TASK_ERROR_MESSAGE.TASK_NOT_FOUND);
      }
      if (!eventID) {
        eventID = (
          await this.assignEventService.getAssigneeEventById(
            taskExist?.eventDivision?.id,
          )
        )?.event?.id;
      }
      await queryRunner.manager.update(TaskEntity, { id: taskID }, data);
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
      let notificationType = ETypeNotification.TASK;
      if (taskExisted?.parentTask !== null) {
        notificationType = ETypeNotification.SUBTASK;
      }
      const dataNotification: NotificationCreateRequest = {
        title: `Công việc đã được cập nhât`,
        content: `${oUser.fullName} đã cập nhât công việc ${taskExisted?.title}`,
        type: notificationType,
        userIdAssignee: listUser?.map((item: any) => item?.assignee),
        userIdTaskMaster: [listUser?.[0]?.taskMaster],
        eventID: eventID,
        parentTaskId: taskExisted?.parent?.id,
        commonId: taskID,
        avatar: oUser?.avatar,
        messageSocket: 'notification',
      };
      console.log('dataNotification:', dataNotification);
      await this.notificationService.createNotification(
        dataNotification,
        oUser?.id,
        queryRunner,
      );
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
      let listIdEventDivison: any = undefined;
      if (eventID) {
        listIdEventDivison =
          await this.assignEventService.getListIdEventDivision(eventID);
        console.log('listIdEventDivison:', listIdEventDivison);
        const arrayPromise = listIdEventDivison?.map((item) => {
          return this.taskRepository.find({
            select: {
              assignTasks: {
                id: true,
                isLeader: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                user: {
                  id: true,
                  email: true,
                  profile: {
                    avatar: true,
                    fullName: true,
                  },
                },
              },
              eventDivision: {
                id: true,
                event: {
                  id: true,
                  eventName: true,
                },
              },
              item: {
                id: true,
                plannedAmount: true,
                plannedPrice: true,
                plannedUnit: true,
              },
            },
            where: {
              priority,
              status,
              assignTasks: {
                assignee,
              },
              eventDivision: {
                id: item?.id,
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
              eventDivision: {
                event: true,
              },
              taskFiles: true,
            },
            order: {
              createdAt: { direction: sort },
              assignTasks: { isLeader: 'DESC' },
            },
          });
        });
        result = (await Promise.all(arrayPromise))?.flatMap((arr) => arr);
      } else {
        result = await this.taskRepository.find({
          select: {
            assignTasks: {
              id: true,
              isLeader: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              user: {
                id: true,
                email: true,
                profile: {
                  avatar: true,
                  fullName: true,
                },
              },
            },
            eventDivision: {
              id: true,
              event: {
                id: true,
                eventName: true,
              },
            },
            item: {
              id: true,
              plannedAmount: true,
              plannedPrice: true,
              plannedUnit: true,
            },
          },
          where: {
            priority,
            status,
            assignTasks: {
              assignee,
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
            eventDivision: {
              event: true,
            },
            taskFiles: true,
          },
          order: {
            createdAt: { direction: sort },
          },
        });
      }
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

  async countTaskInEvent(eventId: string): Promise<number> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const query = await queryRunner.manager.query(`
      SELECT COUNT(t.id) AS count
      FROM ema.tasks t
      WHERE t.eventDivisionId  IN (
          SELECT ae.id
          FROM ema.assign_events ae
          WHERE ae.eventId = "${eventId}"
);
      `);
      console.log(query[0].count);
      const result = query[0].count;
      return Number(result) || 0;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getTaskStatistic(eventId: string): Promise<unknown> {
    try {
      const listIdEventDivison: any =
        await this.assignEventService.getListIdEventDivision(eventId);
      console.log('listIdEventDivison:', listIdEventDivison);
      const arrayPromise = listIdEventDivison?.map((item) => {
        return this.taskRepository.find({
          where: {
            eventDivision: {
              id: item?.id,
            },
          },
        });
      });
      const result = (await Promise.all(arrayPromise))?.flatMap((arr) => arr);
      const taskStatistics = {
        total: result.length,
        pending: result.filter((task) => task.status === ETaskStatus.PENDING)
          .length,
        done: result.filter((task) => task.status === ETaskStatus.DONE).length,
        cancel: result.filter((task) => task.status === ETaskStatus.CANCEL)
          .length,
        overdue: result.filter((task) => task.status === ETaskStatus.OVERDUE)
          .length,
      };
      return taskStatistics;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getNumOfPeopleInTaskStatistic(eventId: string): Promise<unknown> {
    try {
      const listIdEventDivison: any =
        await this.assignEventService.getListIdEventDivision(eventId);
      console.log('listIdEventDivison:', listIdEventDivison);
      const arrayPromise = listIdEventDivison?.map((item) => {
        return this.taskRepository.find({
          where: {
            eventDivision: {
              id: item?.id,
            },
          },
          relations: ['assignTasks'],
        });
      });
      const result = (await Promise.all(arrayPromise))?.flatMap((arr) => arr);
      const uniquePeople = {
        leaders: new Set<string>(),
        members: new Set<string>(),
        taskMasters: new Set<string>(),
      };

      const peopleStatistics = result.reduce(
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

  async checkUserInTask(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<unknown> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const result = await queryRunner.manager.query(`
      SELECT T.*
      FROM tasks T
      INNER JOIN assign_tasks AT ON T.id = AT.taskId
      WHERE AT.assignee = '${userId}' AND (T.status IN ('PENDING', 'PROCESSING')) AND ('${startDate}' <= T.startDate AND '${endDate}' >= T.endDate)
      `);
      console.log('Result: ', result);
      const totalTasks = result.length;
      return {
        totalTasks: totalTasks,
        tasks: result,
      };
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async autoUpdateTask(): Promise<void> {
    try {
      const currentDate = moment().add(7, 'hours').toDate();
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
