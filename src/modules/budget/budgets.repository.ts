import { Repository } from 'typeorm';
import { CustomRepository } from 'src/type-orm/typeorm-ex.decorator';
import { BudgetEntity } from './budget.entity';

@CustomRepository(BudgetEntity)
export default class BudgetRepository extends Repository<BudgetEntity> {}
