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
} from './dto/event.request';
import { AssignEventEntity } from '../assign-event/assign-event.entity';
import { EEventStatus } from 'src/common/enum/enum';
import { AssignEventService } from '../assign-event/assign-event.service';

@Injectable()
export class EventService extends BaseService<EventEntity> {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: EventRepository,
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly assignEventService: AssignEventService,
  ) {
    super(eventRepository);
  }

  generalBuilderEvent(): SelectQueryBuilder<EventEntity> {
    return this.eventRepository.createQueryBuilder('events');
  }

  /**
   *getAllEvent
   * @param eventPagination
   * @returns
   */
  async getAllEvent(
    eventPagination: EventPagination,
  ): Promise<IPaginateResponse<EventResponse>> {
    try {
      const { currentPage, sizePage } = eventPagination;
      const query = this.generalBuilderEvent();
      query.select([
        'events.id as id',
        'events.eventName as eventName',
        'events.description as description',
        'events.coverUrl as coverUrl',
        'events.startDate as startDate',
        'events.endDate as endDate',
        'events.location as location',
        'events.estBudget as estBudget',
        'events.createdAt as createdAt',
        'events.updatedAt as updatedAt',
        'events.status as status',
      ]);
      const [result, total] = await Promise.all([
        query
          .offset((sizePage as number) * ((currentPage as number) - 1))
          .limit(sizePage as number)
          .execute(),
        query.getCount(),
      ]);
      const listStaffOfDivision =
        await this.assignEventService.getListStaffDivisionAllEvent();
      console.log('listStaffOfDivision:', listStaffOfDivision);
      const mapData = result?.map((item) => {
        item.startDate = moment(item.startDate).format('YYYY-MM-DD');
        item.endDate = moment(item.endDate).format('YYYY-MM-DD');
        item.listDivision = listStaffOfDivision?.[`${item.id}`] ?? [];
        return item;
      });
      if (total === 0) {
        throw new NotFoundException('Event not found');
      }
      const data = plainToInstance(EventResponse, mapData);
      return paginateResponse<EventResponse>(
        [data, total],
        currentPage,
        sizePage,
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
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
      return `Event created successfully`;
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
            endDate: event.endDate,
            location: event.location,
            coverUrl: event.coverUrl,
            estBudget: event.estBudget,
          },
        );
        const dataEditDivision: EventAssignRequest = {
          mode: event.mode,
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
    // check division exist in event
    const listFindDivision = data.divisionId.map((division) =>
      queryRunner.manager.findOne(AssignEventEntity, {
        where: {
          event: { id: data.eventId },
          division: { id: division },
        },
      }),
    );
    const checkExistDivision = (await Promise.all(listFindDivision)).filter(
      (item) => item !== null,
    );
    if (data.mode === 1 && checkExistDivision.length > 0) {
      throw new BadRequestException('Division already exists in event');
    } else if (data.mode === 2 && checkExistDivision.length === 0) {
      throw new BadRequestException("Division don't exists in event");
    }
    // Mode 1: assign division
    const dataInsert = data.divisionId.map((item) => {
      return {
        event: { id: data.eventId },
        division: { id: item },
      };
    });
    if (data.mode === 1) {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(AssignEventEntity)
        .values(dataInsert)
        .execute();
    } else {
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(AssignEventEntity)
        .where('id In(:id)', {
          id: checkExistDivision.map((item) => item.id).join(','),
        })
        .execute();
    }
    return data.mode === 1
      ? `Add division into event successfully!!!`
      : 'Remove division into event successfully!!!';
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
}
