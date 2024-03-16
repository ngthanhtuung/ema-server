import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { BudgetEntity } from './budgets.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePlanBudgetRequest } from './dto/budget.request';
import { ItemEntity } from '../items/items.entity';
import { TransactionEntity } from './transactions.entity';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(BudgetEntity)
    private readonly budgetRepository: Repository<BudgetEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}
}
