import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BudgetEntity } from './budgets.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePlanBudgetRequest } from './dto/budget.request';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(BudgetEntity)
    private readonly budgetRepository: Repository<BudgetEntity>,
  ) {}
}
