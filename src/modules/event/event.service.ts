import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import { IPaginateResponse, paginateResponse } from '../base/filter.pagination';
import { EventEntity } from './event.entity';
import EventRepository from './event.repository';
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
import { EEventStatus, ERole } from 'src/common/enum/enum';
import { AssignEventService } from '../assign-event/assign-event.service';
import { FileService } from 'src/file/file.service';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { TaskService } from '../task/task.service';
@Injectable()
export class EventService extends BaseService<EventEntity> {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: EventRepository,
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly fileService: FileService,
    private readonly assignEventService: AssignEventService,
    private configService: ConfigService,
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
      query.leftJoin('tasks', 'tasks', 'tasks.eventID = events.id');
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
      dataPromise[0] = dataPromise[0]?.map((item) => {
        item.startDate = moment(item.startDate).format('YYYY-MM-DD');
        item.endDate = moment(item.endDate).format('YYYY-MM-DD');
        item.createdAt = moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss');
        item.updatedAt = moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss');
        item.listDivision = listStaffOfDivision?.[`${item.id}`] ?? [];
        item.taskCount = +item.taskCount;
        return item;
      });
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
      const event = await this.findOne({
        where: { id: id },
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      const listStaffOfDivision =
        await this.assignEventService.getListStaffDivisionByEventID(id);
      const finalRes = { ...event, listDivision: listStaffOfDivision || [] };
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
  async getAllEventByDivisionID(
    divisionID: string,
  ): Promise<Array<EventResponse>> {
    try {
      const data = await this.assignEventService.getEventByDivisionID(
        divisionID,
      );
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
  async createEvent(event: EventCreateRequest): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.startTransaction();
      const createEvent = await queryRunner.manager.insert(EventEntity, {
        eventName: event.eventName,
        description: event.description,
        startDate: event.startDate,
        processingDate: event.processingDate,
        endDate: event.endDate,
        location: event.location,
        coverUrl: event.coverUrl,
        estBudget: event.estBudget,
      });
      const arrayPromise = event.divisionId.map((id) =>
        queryRunner.manager.insert(AssignEventEntity, {
          event: { id: createEvent.generatedMaps[0]['id'] },
          division: { id: id },
        }),
      );
      await Promise.all(arrayPromise);
      await queryRunner.commitTransaction();
      return `${createEvent.generatedMaps[0]['id']}`;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    }
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
    const dataInsert = data.divisionId.map((item) => {
      return {
        event: { id: data.eventId },
        division: { id: item },
      };
    });
    const assignedExisted = await queryRunner.manager.find(AssignEventEntity, {
      where: { event: { id: data.eventId } },
    });
    const deleteAssignDivision = assignedExisted?.map((item) => {
      queryRunner.manager.delete(AssignEventEntity, { id: item.id });
    });
    if (deleteAssignDivision.length !== 0) {
      await Promise.all(deleteAssignDivision);
    }
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(AssignEventEntity)
      .values(dataInsert)
      .execute();

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

  async generateQRCode(eventId: string, type: string): Promise<string> {
    try {
      const env = this.configService.get<string>('ENVIRONMENT');
      const server_host = this.configService.get<string>('SERVER_HOST');
      const port = this.configService.get<string>('PORT');
      const path_open_api = this.configService.get<string>('PATH_OPEN_API');
      const event = await this.findOne({
        where: { id: eventId },
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      switch (type) {
        case 'CHECK-IN':
          let checkInUrl;
          if (env === 'production') {
            checkInUrl = `${server_host}/${path_open_api}/timesheet/check-in?eventId=${eventId}`;
          } else {
            checkInUrl = `${server_host}:${port}/${path_open_api}/timesheet/check-in?eventId=${eventId}`;
          }
          const checkInQRCode = await QRCode.toDataURL(checkInUrl);
          const checkInDataURL = await this.fileService.uploadFile(
            {
              fileName: `${eventId}_checkin.png`,
              fileType: 'image/png',
              fileBuffer: Buffer.from(checkInQRCode.split(',')[1], 'base64'),
            },
            'checkInQRCode',
          );
          const checkInQrResult = await this.eventRepository.update(
            { id: eventId },
            { checkInQRCode: checkInDataURL['downloadUrl'] },
          );
          return checkInQrResult.affected > 0
            ? checkInDataURL['downloadUrl']
            : 'Has Error';
          break;

        case 'CHECK-OUT':
          const checkOutQRCode = await QRCode.toDataURL(eventId);
          const checkOutDataURL = await this.fileService.uploadFile(
            {
              fileName: `${eventId}_checkout.png`,
              fileType: 'image/png',
              fileBuffer: Buffer.from(checkOutQRCode.split(',')[1], 'base64'),
            },
            'checkOutQRCode',
          );
          const checkOutQrResult = await this.eventRepository.update(
            { id: eventId },
            { checkOutQRCode: checkOutDataURL['downloadUrl'] },
          );
          return checkOutQrResult.affected > 0
            ? checkInDataURL['downloadUrl']
            : 'Has Error';
          break;
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getQrCheckIn(eventId: string): Promise<string> {
    try {
      const event = await this.findOne({
        where: { id: eventId },
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      return event.checkInQRCode;
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
      const query = `SELECT p.profileId as 'id',
                            p.role ,
                            p.fullName ,
                            p.dob,
                            p.nationalId ,
                            p.gender,
                            p.address,
                            p.phoneNumber,
                            p.avatar 
      FROM events e inner join assign_events ae ON e.id = ae.eventId 
              inner join divisions d on ae.divisionId = d.id 
              inner join users u on d.id = u.divisionId 
              inner join profiles p on u.id = p.profileId 
      where e.id = '${eventId}';`;
      const data = await this.eventRepository.query(query);
      return data;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getListEventByTask(): Promise<undefined> {
    try {
      const events = await this.eventRepository.query(`
      SELECT e.* 
      FROM events e inner join tasks t ON e.id = t.eventID 
      WHERE t.startDate >= '${moment().format('YYYY-MM-DD HH:mm:ss')}'
      `);
      return events;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
