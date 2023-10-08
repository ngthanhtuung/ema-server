import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
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
    return this.eventRepository.createQueryBuilder('event');
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
        'event.id as id',
        'event.eventName as eventName',
        'event.description as description',
        'event.coverUrl as coverUrl',
        'event.startDate as startDate',
        'event.endDate as endDate',
        'event.location as location',
        'event.estBudget as estBudget',
        'event.createdAt as createdAt',
        'event.updatedAt as updatedAt',
        'event.status as status',
      ]);
      const [result, total] = await Promise.all([
        query
          .offset((sizePage as number) * ((currentPage as number) - 1))
          .limit(sizePage as number)
          .execute(),
        query.getCount(),
      ]);
      const mapData = result?.map((item) => {
        item.startDate = moment(item.startDate).format('YYYY-MM-DD');
        item.endDate = moment(item.endDate).format('YYYY-MM-DD');
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
   * @param event
   * @returns
   */
  async updateEvent(event: EventUpdateRequest): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      const checkExist = await this.getEventById(event.eventId);
      if (checkExist) {
        await queryRunner.startTransaction();
        await queryRunner.manager.update(
          EventEntity,
          { id: event.eventId },
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
          eventId: event.eventId,
          divisionId: event.divisionId,
        };
        await this.editDivisionIntoEvent(dataEditDivision);
        await queryRunner.commitTransaction();
        return `Update event successfully`;
      } else {
        throw new NotFoundException("Event don't exist!!!");
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    }
  }

  /**
   * editDivisionIntoEvent
   * @param data
   * @returns
   */
  async editDivisionIntoEvent(data: EventAssignRequest): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.startTransaction();
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
      let arrayPromise = [];
      if (data.mode === 1 && checkExistDivision.length > 0) {
        throw new BadRequestException('Division already exists in event');
      } else if (
        data.mode === 2 &&
        checkExistDivision.length === 0 &&
        data.divisionId.length !== 0
      ) {
        throw new BadRequestException("Division don't exists in event");
      }
      // Mode 1: assign division
      if (data.mode === 1) {
        arrayPromise = data.divisionId.map((id) =>
          queryRunner.manager.insert(AssignEventEntity, {
            event: { id: data.eventId },
            division: { id: id },
          }),
        );
      } else {
        // Mode 2: remove division
        arrayPromise = data.divisionId.map((id) =>
          queryRunner.manager.delete(AssignEventEntity, {
            event: { id: data.eventId },
            division: { id: id },
          }),
        );
      }
      await Promise.all(arrayPromise);
      await queryRunner.commitTransaction();
      return data.mode === 1
        ? `Add division into event successfully!!!`
        : 'Remove division into event successfully!!!';
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    }
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
