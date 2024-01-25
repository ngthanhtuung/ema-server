import { messaging } from 'firebase-admin';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EventTypeEntity } from './event_types.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EventTypesService {
  constructor(
    @InjectRepository(EventTypeEntity)
    private readonly eventTypeRepository: Repository<EventTypeEntity>,
  ) {}

  async findAll(): Promise<EventTypeEntity[] | undefined> {
    try {
      const result = await this.eventTypeRepository.find({});
      if (result) {
        return result;
      }
    } catch (err) {
      throw new InternalServerErrorException(err.messaging);
    }
  }
}
