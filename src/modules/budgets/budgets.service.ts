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

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(BudgetEntity)
    private readonly budgetRepository: Repository<BudgetEntity>,
  ) {}
}
