import { Repository } from 'typeorm';
import { CustomRepository } from 'src/type-orm/typeorm-ex.decorator';
import { AssignEventEntity } from './assign-event.entity';

@CustomRepository(AssignEventEntity)
export default class AssignEventRepository extends Repository<AssignEventEntity> {}
