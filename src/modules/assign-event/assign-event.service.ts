import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { AssignEventEntity } from './assign-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import AssignEventRepository from './assign-event.repository';
import { SelectQueryBuilder } from 'typeorm';
import { EventResponse } from '../event/dto/event.response';

@Injectable()
export class AssignEventService extends BaseService<AssignEventEntity> {
  constructor(
    @InjectRepository(AssignEventEntity)
    private readonly assignEventRepository: AssignEventRepository,
  ) {
    super(assignEventRepository);
  }

  generalBuilderAssignEvent(): SelectQueryBuilder<AssignEventEntity> {
    return this.assignEventRepository.createQueryBuilder('assign_events');
  }

  /**
   * getEventById
   * @param id
   * @returns
   */
  async getEventByDivisionID(id: string): Promise<Array<EventResponse>> {
    try {
      const query = this.generalBuilderAssignEvent();
      query.leftJoin('events', 'events', 'assign_events.eventId = events.id');
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
      query.where('assign_events.divisionId = :divisionId', {
        divisionId: id,
      });
      const data = await query.execute();
      return data;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
