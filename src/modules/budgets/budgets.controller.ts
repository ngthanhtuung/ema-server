import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';

@Controller('budget')
@ApiBearerAuth()
@ApiTags('Budget')
export class BudgetsController {
  constructor(private readonly budgetService: BudgetsService) {}
}
