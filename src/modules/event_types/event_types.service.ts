import { messaging } from 'firebase-admin';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { EventTypeEntity } from './event_types.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EventTypesService {
  constructor(
    @InjectRepository(EventTypeEntity)
    private readonly eventTypeRepository: Repository<EventTypeEntity>,
  ) {}

  async findById(id: string): Promise<EventTypeEntity | undefined> {
    try {
      const eventType = await this.eventTypeRepository.findOne({
        where: { id },
      });
      if (eventType) {
        return eventType;
      }
      throw new NotFoundException('Event type not found, please try again');
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
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
