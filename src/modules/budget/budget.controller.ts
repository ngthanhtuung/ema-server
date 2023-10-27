import { BudgetService } from './budget.service';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  BudgetsCreateRequest,
  BudgetsUpdateRequest,
} from './dto/budgets.request';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/decorators/getUser.decorator';
import { BudgetsPagination } from './dto/budgets.pagination';
import { IPaginateResponse } from '../base/filter.pagination';
import { BudgetsResponse } from './dto/budgets.response';
import { ERole, EStatusBudgets } from 'src/common/enum/enum';
import { Roles } from 'src/decorators/role.decorator';
@Controller('budget')
@ApiBearerAuth()
@ApiTags('Budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  /**
   * getAllBudgetsByEvent
   * @param eventID
   * @param budgetPagination
   * @returns
   */

  @Get('/:eventID')
  async getAllBudgetsByEvent(
    @Param('eventID') eventID: string,
    @Query() budgetPagination: BudgetsPagination,
    @Query('mode') mode: number,
  ): Promise<IPaginateResponse<BudgetsResponse[]>> {
    return await this.budgetService.getAllBudgetsByEventID(
      budgetPagination,
      eventID,
      mode,
    );
  }

  /**
   * createEvent
   * @param data
   */
  @Post()
  async createBudgetRequest(
    @Body() data: BudgetsCreateRequest,
  ): Promise<string | undefined> {
    return await this.budgetService.createBudgetRequest(data);
  }

  /**
   * updateBudget
   * @param data
   */
  @Put('/:budgetsId')
  @Roles(ERole.MANAGER, ERole.STAFF)
  async updateBudget(
    @Param('budgetsId') budgetId: string,
    @Body() data: BudgetsUpdateRequest,
  ): Promise<string | undefined> {
    return await this.budgetService.updateBudget(budgetId, data);
  }

  /**
   * updateBudgetStatus
   * @param budgetId
   * @param status
   */
  @Put('/:budgetsId/:status')
  @Roles(ERole.MANAGER)
  @ApiParam({ name: 'status', enum: EStatusBudgets })
  async updateBudgetStatus(
    @Param('budgetsId') budgetId: string,
    @Param('status') status: EStatusBudgets,
    @GetUser() user: string,
  ): Promise<string | undefined> {
    const idUser = JSON.parse(user).id;
    return await this.budgetService.updateBudgetStatus(
      budgetId,
      status,
      idUser,
    );
  }
}
