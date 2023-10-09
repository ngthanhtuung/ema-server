import { CustomRepository } from 'src/type-orm/typeorm-ex.decorator';
import { TaskEntity } from './task.entity';
import { Repository } from 'typeorm';

@CustomRepository(TaskEntity)
export default class TaskRepository extends Repository<TaskEntity> {}
