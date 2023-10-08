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
    return this.assignEventRepository.createQueryBuilder('assign_event');
  }

  /**
   * getEventById
   * @param id
   * @returns
   */
  async getEventByDivisionID(id: string): Promise<Array<EventResponse>> {
    try {
      const query = this.generalBuilderAssignEvent();
      query.leftJoin('event', 'event', 'assign_event.eventId = event.id');
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
      query.where('assign_event.divisionId = :divisionId', {
        divisionId: id,
      });
      const data = await query.execute();
      return data;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
