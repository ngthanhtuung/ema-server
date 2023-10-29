import { CustomRepository } from 'src/type-orm/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { AnnualLeaveEntity } from './annual-leave.entity';

@CustomRepository(AnnualLeaveEntity)
export default class AnnualLeaveRepository extends Repository<AnnualLeaveEntity> {}
