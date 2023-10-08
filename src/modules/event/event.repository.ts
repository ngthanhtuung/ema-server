import { Repository } from 'typeorm';
import { CustomRepository } from 'src/type-orm/typeorm-ex.decorator';
import { EventEntity } from './event.entity';

@CustomRepository(EventEntity)
export default class EventRepository extends Repository<EventEntity> {}
