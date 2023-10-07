import { Repository } from 'typeorm';
import { TaskFileEntity } from './taskFile.entity';
import { CustomRepository } from 'src/type-orm/typeorm-ex.decorator';

@CustomRepository(TaskFileEntity)
export default class TaskFileRepository extends Repository<TaskFileEntity> {}
