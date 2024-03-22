/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContractsService } from './../contracts/contracts.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  DataSource,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import { IPaginateResponse, paginateResponse } from '../base/filter.pagination';
import { EventEntity } from './event.entity';
import { EventPagination } from './dto/event.pagination';
import { EventResponse } from './dto/event.response';
import * as moment from 'moment-timezone';
import {
  EventAssignRequest,
  EventCreateRequest,
  EventUpdateRequest,
  FilterEvent,
} from './dto/event.request';
import { AssignEventEntity } from '../assign-event/assign-event.entity';
import {
  EEventStatus,
  ERole,
  EEventDate,
  EStatusAssignee,
  EContractStatus,
  EContactInformation,
} from 'src/common/enum/enum';
import { AssignEventService } from '../assign-event/assign-event.service';
import { EventTypeEntity } from '../event_types/event_types.entity';
import { UserEntity } from '../user/user.entity';
import { TaskService } from '../task/task.service';
import { CustomerContactEntity } from '../customer_contacts/customer_contacts.entity';
import { ContractEntity } from '../contracts/contracts.entity';
import { TaskEntity } from '../task/task.entity';
import { ItemEntity } from '../items/items.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class EventService extends BaseService<EventEntity> {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly assignEventService: AssignEventService,
    private readonly taskService: TaskService,
  ) {
    super(eventRepository);
  }

  generalBuilderEvent(): SelectQueryBuilder<EventEntity> {
    return this.eventRepository.createQueryBuilder('events');
  }

  /**
   * filterEventByCondition
   * @param filter
   * @returns
   */
  async filterEventByCondition(
    filter: FilterEvent,
    eventPagination: EventPagination,
  ): Promise<IPaginateResponse<EventResponse>> {
    try {
      const { eventName, monthYear, nameSort, sort, status } = filter;
      const { currentPage, sizePage } = eventPagination;
      const query = this.generalBuilderEvent();
      query.leftJoin(
        'assign_events',
        'assign_events',
        'assign_events.eventID = events.id',
      );
      query.leftJoin(
        'tasks',
        'tasks',
        'tasks.eventDivision = assign_events.id',
      );
      query.leftJoin(
        'event_types',
        'event_types',
        'event_types.id = events.eventTypeId',
      );
      query.select([
        'events.id as id',
        'events.eventName as eventName',
        'events.description as description',
        'events.coverUrl as coverUrl',
        'events.startDate as startDate',
        'events.processingDate as processingDate',
        'events.endDate as endDate',
        'events.location as location',
        'events.estBudget as estBudget',
        'events.createdAt as createdAt',
        'events.updatedAt as updatedAt',
        'events.status as status',
        'event_types.typeName as typeName',
        'COUNT(tasks.id) as taskCount',
      ]);
      query.where('tasks.parentTask IS NULL AND events.isTemplate = 0');
      if (status) {
        query.andWhere('events.status = :status', {
          status: status,
        });
      }
      if (eventName) {
        query.andWhere(`events.eventName LIKE '%${eventName}%'`);
      }
      query.groupBy('events.id');
      query.orderBy(`events.${nameSort}`, sort);
      const dataPromise = await Promise.all([
        query
          .offset((sizePage as number) * ((currentPage as number) - 1))
          .limit(sizePage as number)
          .execute(),
        query.getCount(),
      ]);
      if (monthYear) {
        dataPromise[0] = dataPromise[0].filter((item) => {
          const formatTime = moment(item[`${nameSort}`]).format('YYYY-MM');
          return moment(formatTime).isSame(monthYear);
        });
      }
      const listStaffOfDivision =
        await this.assignEventService.getListStaffDivisionAllEvent();
      const finalData = dataPromise[0].map((item) => {
        return {
          ...item,
          startDate: moment(item.startDate).format('YYYY-MM-DD'),
          endDate: moment(item.endDate).format('YYYY-MM-DD'),
          createdAt: moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
          listDivision: listStaffOfDivision?.[`${item.id}`] ?? [],
          taskCount: Number(item?.taskCount),
        };
      });
      dataPromise[0] = finalData;
      const data = plainToInstance(EventResponse, dataPromise[0]);
      return paginateResponse<EventResponse>(
        [data, dataPromise[1]],
        currentPage,
        sizePage,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * getEventById
   * @param id
   * @returns
   */
  async getEventById(id: string): Promise<EventResponse> {
    try {
      const query = this.generalBuilderEvent();
      query.leftJoin(
        'assign_events',
        'assign_events',
        'assign_events.eventID = events.id',
      );
      query.leftJoin(
        'tasks',
        'tasks',
        'tasks.eventDivision = assign_events.id',
      );
      query.leftJoin(
        'event_types',
        'event_types',
        'event_types.id = events.eventTypeId',
      );
      query.select([
        'events.id as id',
        'events.eventName as eventName',
        'events.description as description',
        'events.coverUrl as coverUrl',
        'events.startDate as startDate',
        'events.processingDate as processingDate',
        'events.endDate as endDate',
        'events.location as location',
        'events.estBudget as estBudget',
        'events.createdAt as createdAt',
        'events.updatedAt as updatedAt',
        'events.status as status',
        'event_types.typeName as typeName',
        'event_types.id as eventTypeID',
        'COUNT(tasks.id) as taskCount',
      ]);
      query.where('events.id = :id', {
        id,
      });
      const dataEvent = await query.execute();
      if (!dataEvent) {
        throw new NotFoundException('Event not found');
      }
      const listStaffOfDivision =
        await this.assignEventService.getListStaffDivisionByEventID(id);
      const item = dataEvent[0];
      const finalRes = {
        ...dataEvent[0],
        startDate: moment(item.startDate).format('YYYY-MM-DD'),
        endDate: moment(item.endDate).format('YYYY-MM-DD'),
        processingDate: moment(item.processingDate).format('YYYY-MM-DD'),
        createdAt: moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        listDivision: listStaffOfDivision || [],
        taskCount: Number(dataEvent?.[0]?.taskCount),
      };
      return plainToClass(EventResponse, finalRes);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * getEventTemplate
   * @returns
   */
  async getEventTemplate(): Promise<EventResponse> {
    try {
      const event = await this.findOne({
        where: { isTemplate: true },
        select: {
          assignEvents: {
            id: true,
            division: {
              id: true,
            },
            tasks: {
              id: true,
              status: true,
            },
          },
          eventType: {
            typeName: true,
          },
        },
        relations: {
          eventType: true,
          assignEvents: {
            division: true,
            tasks: true,
          },
        },
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      return plainToClass(EventResponse, event);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * getAllEventByUserID
   * @param divisionID
   * @returns
   */
  async getAllEventByDivisionID(divisionID: string): Promise<Array<any>> {
    try {
      const data = await this.eventRepository.find({
        select: {
          assignEvents: {
            id: true,
            division: {
              id: true,
            },
            tasks: {
              id: true,
              status: true,
            },
          },
          eventType: {
            typeName: true,
          },
        },
        where: {
          assignEvents: {
            division: {
              id: divisionID,
            },
          },
        },
        relations: {
          eventType: true,
          assignEvents: {
            division: true,
            tasks: true,
          },
        },
      });
      console.log('data:', data);
      const currentDate = moment().tz('Asia/Bangkok');
      const result = data
        .map((item) => {
          const diffYears = moment(item.processingDate)
            .tz('Asia/Bangkok')
            .diff(currentDate, 'years');
          const diffMonths = moment(item.processingDate)
            .tz('Asia/Bangkok')
            .diff(currentDate, 'months');
          const diffDays = moment(item.processingDate)
            .tz('Asia/Bangkok')
            .diff(currentDate, 'days');
          let totalTimeRemaining = diffYears;
          let typeTimeRemaining = 3;
          if (diffYears <= 0) {
            totalTimeRemaining = diffMonths;
            typeTimeRemaining = 2;
          }
          if (diffMonths <= 0) {
            totalTimeRemaining = diffDays;
            typeTimeRemaining = 1;
          }
          const res = {
            id: item.id,
            eventName: item.eventName,
            startDate: item.startDate,
            processingDate: item.processingDate,
            endDate: item.endDate,
            location: item.location,
            meetingUrl: item.meetingUrl,
            description: item.description,
            coverUrl: item.coverUrl,
            estBudget: item.estBudget,
            status: item.status,
            createdBy: item.createdBy,
            eventTypeName: item.eventType.typeName,
            tasks: item.assignEvents[0].tasks,
            totalTimeRemaining: totalTimeRemaining,
            typeTimeRemaining: typeTimeRemaining,
          };
          return res;
        })
        .sort((a, b) => {
          if (a.typeTimeRemaining === b.typeTimeRemaining) {
            return a.totalTimeRemaining - b.totalTimeRemaining;
          }
          return a.typeTimeRemaining - b.typeTimeRemaining;
        });
      return result;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * getAllEventByCustomer
   * @param email
   * @returns
   */
  async getAllEventByCustomer(email: string): Promise<EventEntity[]> {
    try {
      const data = await this.eventRepository.find({
        where: {
          contract: {
            customerEmail: email,
          },
        },
        relations: {
          contract: true,
        },
      });
      return data;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * getAllEventUserDoing
   * @param userId
   * @returns
   */
  async getAllEventUserDoing(data: object): Promise<EventEntity[]> {
    const userId = data['userId'];
    const status = data['status'];

    try {
      // Case in event today
      const today = moment().format('YYYY/MM/DD HH:mm:ss.SSS');
      let data = [];

      data = await this.eventRepository.find({
        where: {
          assignEvents: {
            tasks: {
              assignTasks: {
                status: EStatusAssignee.ACTIVE,
                user: {
                  id: userId,
                },
              },
            },
          },
        },
      });
      data = data.filter((item) => {
        const checkInToday = moment(today).isBetween(
          moment(item?.startDate),
          moment(item?.endDate),
          'dates',
          '[]',
        );
        const checkInComming = moment(today).isBefore(
          moment(item?.startDate),
          'dates',
        );
        const checkCondition =
          status === EEventDate.TODAY
            ? checkInToday &&
              ![EEventStatus.DONE, EEventStatus.CANCEL].includes(item?.status)
            : checkInComming &&
              ![EEventStatus.DONE, EEventStatus.CANCEL].includes(item?.status);
        if (checkCondition) {
          return item;
        }
      });
      return data;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * createEvent
   * @param event
   * @returns
   */
  async createEvent(
    event: EventCreateRequest,
    user: UserEntity,
    contactId: string,
  ): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    const callback = async (queryRunner: QueryRunner): Promise<void> => {
      const eventType = await queryRunner.manager.findOne(EventTypeEntity, {
        where: { id: event.eventTypeId },
      });
      if (!eventType) {
        throw new NotFoundException('Event type not found');
      }
      const customerContact = await queryRunner.manager.findOne(
        CustomerContactEntity,
        {
          where: { id: contactId },
          relations: ['contract'],
        },
      );
      if (!customerContact) {
        throw new NotFoundException('Thông tin liên hệ này không tồn tại');
      }
      if (customerContact.contract.status !== EContractStatus.PAID) {
        throw new BadRequestException(
          'Hợp đồng này chưa được thanh toán nên không thể tạo được sự kiện',
        );
      }
      const createEvent = await queryRunner.manager.insert(EventEntity, {
        eventName: event.eventName,
        description: event.description,
        startDate: event.startDate,
        processingDate: event.processingDate,
        endDate: event.endDate,
        location: event.location,
        coverUrl: event.coverUrl,
        estBudget: event.estBudget,
        eventType: eventType,
        status: EEventStatus.PREPARING,
        createdBy: user.id,
        contract: customerContact?.contract,
      });
      console.log(
        "createEvent.generatedMaps[0]['id']:",
        createEvent.generatedMaps[0]['id'],
      );
      // Update Contract Status
      await queryRunner.manager.update(
        ContractEntity,
        { id: customerContact?.contract?.id },
        {
          status: EContractStatus.SUCCESS,
        },
      );
      // Update Customer Contact Status
      await queryRunner.manager.update(
        CustomerContactEntity,
        { id: contactId },
        {
          status: EContactInformation.SUCCESS,
        },
      );
      // Assigne divsion into event
      const dataEditDivision = event.listDivision.map((item) => {
        return {
          event: { id: createEvent.generatedMaps[0]['id'] },
          division: { id: item },
        };
      });
      const data = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(AssignEventEntity)
        .values(dataEditDivision)
        .execute();
      const listUpdatePercentage = [];
      const listInsertTask = event.listTask.map((task) => {
        const {
          title,
          startDate,
          endDate,
          desc,
          priority,
          parentTask,
          estimationTime,
          isTemplate,
          itemId,
          itemPercentage,
        } = task;
        listUpdatePercentage.push(
          queryRunner.manager.update(
            ItemEntity,
            { id: itemId },
            {
              percentage: itemPercentage,
            },
          ),
        );
        return {
          title: title,
          createdBy: user.id,
          eventDivision: {
            id: data?.generatedMaps?.[0]?.id,
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
          item: {
            id: itemId,
          },
        };
      });
      await Promise.all([
        ...listUpdatePercentage,
        queryRunner.manager.insert(TaskEntity, listInsertTask),
      ]);
    };
    await this.transaction(callback, queryRunner);
    return `Created event successfully`;
  }

  /**
   * updateEvent
   * @param eventId
   * @param event
   * @returns
   */
  async updateEvent(
    eventId: string,
    event: EventUpdateRequest,
    user: UserEntity,
  ): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    const callback = async (queryRunner: QueryRunner): Promise<void> => {
      const checkExist = await this.getEventById(eventId);
      if (checkExist) {
        await queryRunner.manager.update(
          EventEntity,
          { id: eventId },
          {
            eventName: event.eventName,
            description: event.description,
            startDate: event.startDate,
            processingDate: event.processingDate,
            endDate: event.endDate,
            location: event.location,
            coverUrl: event.coverUrl,
            estBudget: event.estBudget,
            updatedBy: user.id,
            updatedAt: moment()
              .tz('Asia/Bangkok')
              .format('YYYY-MM-DD HH:mm:ss'),
          },
        );
        const dataEditDivision: EventAssignRequest = {
          eventId: eventId,
          divisionId: event.divisionId,
        };
        await this.editDivisionIntoEvent(dataEditDivision, queryRunner);
      } else {
        throw new NotFoundException("Event don't exist!!!");
      }
    };
    await this.transaction(callback, queryRunner);
    return 'Update event successfully!!!';
  }

  /**
   * editDivisionIntoEvent
   * @param data
   * @returns
   */
  async editDivisionIntoEvent(
    data: EventAssignRequest,
    queryRunner?: QueryRunner,
  ): Promise<string> {
    if (!queryRunner) {
      queryRunner = this.dataSource.createQueryRunner();
    }
    // Get Divison By Event
    const divisionEventExisted = await queryRunner.manager.find(
      AssignEventEntity,
      {
        where: { event: { id: data.eventId } },
        select: {
          division: {
            id: true,
          },
        },
        relations: {
          // event: true,
          division: true,
        },
      },
    );
    console.log('assignedExisted:', divisionEventExisted);

    const dataInsert = data.divisionId.reduce((dataInsert, item) => {
      const checkExistDivision = divisionEventExisted.find(
        (division) => division.division.id === item,
      );
      if (!checkExistDivision) {
        dataInsert.push({
          event: { id: data.eventId },
          division: { id: item },
        });
      }
      return dataInsert;
    }, []);
    console.log('dataInsert:', dataInsert);
    if (dataInsert.length > 0) {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(AssignEventEntity)
        .values(dataInsert)
        .execute();
    }
    return `Update division into event successfully!!!`;
  }

  /**
   * updateEventStatus
   * @param eventID
   * @param status
   * @returns
   */
  async updateEventStatus(
    eventID: string,
    status: EEventStatus,
  ): Promise<string> {
    try {
      const eventExisted = await this.getEventById(eventID);
      if (!eventExisted) {
        throw new NotFoundException("Event don't exist!!!");
      }
      await this.eventRepository.update({ id: eventID }, { status: status });
      return 'Update status successfully!!!';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async eventStatistics(mode: EEventStatus, user: string): Promise<unknown> {
    try {
      let events;
      if (JSON.parse(user).role === ERole.MANAGER) {
        if (mode === undefined || mode === EEventStatus.ALL) {
          events = await this.eventRepository.find({
            where: { isTemplate: false },
            select: ['id', 'eventName', 'startDate', 'endDate', 'status'],
          });
          console.log('Event at statistic: ', events);
        } else {
          events = await this.eventRepository.find({
            where: { status: mode, isTemplate: false },
            select: ['id', 'eventName', 'startDate', 'endDate', 'status'],
          });
        }
      } else {
        if (mode === undefined || mode === EEventStatus.ALL) {
          events = await this.eventRepository.find({
            where: {
              isTemplate: false,
            },
            select: ['id', 'eventName', 'startDate', 'endDate', 'status'],
          });
        } else {
          events = await this.eventRepository.find({
            where: { status: mode, isTemplate: false },
            select: ['id', 'eventName', 'startDate', 'endDate', 'status'],
          });
        }
      }
      const eventStatisticPromises = events.map(async (event) => {
        const taskStatistic = await this.taskService.getTaskStatistic(event.id);
        const peopleInTaskStatistic =
          await this.taskService.getNumOfPeopleInTaskStatistic(event.id);
        return {
          id: event.id,
          eventName: event.eventName,
          startDate: event.startDate,
          endDate: event.endDate,
          status: event.status,
          tasks: taskStatistic,
          totalMember: peopleInTaskStatistic,
        };
      });
      const eventStatistic = await Promise.all(eventStatisticPromises);
      return eventStatistic;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getUserInEvent(eventId: string): Promise<unknown> {
    try {
      const query = `SELECT p.id as 'id', u.roleId,
                            p.fullName,
                            p.dob,
                            p.nationalId,
                            p.gender,
                            p.address,
                            p.phoneNumber,
                            p.avatar
                     FROM events e
                              inner join assign_events ae ON e.id = ae.eventId
                              inner join divisions d on ae.divisionId = d.id
                              inner join users u on d.id = u.divisionId
                              inner join profiles p on u.id = p.id
                     where e.id = '${eventId}';`;
      const data = await this.eventRepository.query(query);
      return data;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getListEventByTask(userIdLogin: string): Promise<undefined> {
    try {
      const events = await this.eventRepository.query(`
          SELECT e.*
          FROM events e
                   inner join assign_events ae ON
              e.id = ae.eventID
              inner join tasks t ON
              ae.id = t.eventDivisionId
                   inner join assign_tasks at2 ON
              t.id = at2.taskID
          WHERE t.startDate >= '${moment().format('YYYY-MM-DD HH:mm:ss')}'
            AND at2.assignee = '${userIdLogin}';
      `);
      return events;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoUpdateTask(): Promise<void> {
    try {
      const currentDate = moment().add(7, 'hours').format('YYYY-MM-DD');
      console.log('currentDate:', currentDate);
      const listEvent = await this.eventRepository.find({
        where: [
          { status: EEventStatus.PENDING },
          { status: EEventStatus.PREPARING },
          { status: EEventStatus.PROCESSING },
          { isTemplate: false },
        ],
      });
      console.log('listEvent:', listEvent);
      const events = {
        [EEventStatus.PENDING]: [],
        [EEventStatus.PREPARING]: [],
        [EEventStatus.PROCESSING]: [],
      };
      listEvent.forEach((item) => {
        const date = {
          [EEventStatus.PENDING]: item.startDate,
          [EEventStatus.PREPARING]: item.processingDate,
          [EEventStatus.PROCESSING]: item.endDate,
        }[item.status];
        if (moment(date).format('YYYY-MM-DD') === currentDate) {
          events[item.status].push(item);
        }
      });
      const eventPending = events[EEventStatus.PENDING];
      const eventPreparing = events[EEventStatus.PREPARING];
      const eventProcessing = events[EEventStatus.PROCESSING];
      // List all event have status pending to update preparing
      console.log('eventPending:', eventPending);
      if (eventPending.length > 0) {
        await Promise.all(
          eventPending.map((event) => {
            return this.eventRepository.update(
              { id: event.id },
              { status: EEventStatus.PREPARING },
            );
          }),
        );
        console.log('Update status event pending to preparing');
      }
      // List all event have status Preparing to update Processing
      console.log('eventPreparing:', eventPreparing);
      if (eventPreparing.length > 0) {
        await Promise.all(
          eventPreparing.map((event) => {
            return this.eventRepository.update(
              { id: event?.id },
              { status: EEventStatus.PROCESSING },
            );
          }),
        );
        console.log(
          'Update status event have status Prepairing to update Processing',
        );
      }
      // List all event have status Processing to update Done
      console.log('eventProcessing:', eventProcessing);
      if (eventPreparing.length > 0) {
        await Promise.all(
          eventProcessing.map((event) => {
            return this.eventRepository.update(
              { id: event?.id },
              { status: EEventStatus.DONE },
            );
          }),
        );
        console.log(
          'Update status event have status Processing to update Done',
        );
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
