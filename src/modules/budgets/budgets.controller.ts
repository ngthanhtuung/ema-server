import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import {
  CreateTransactionRequest,
  FilterBigTaskAndItem,
} from './dto/budget.request';
import { Roles } from '../../decorators/role.decorator';
import { ERole } from '../../common/enum/enum';
import { GetUser } from '../../decorators/getUser.decorator';

@Controller('budget')
@ApiBearerAuth()
@ApiTags('Budget')
export class BudgetsController {
  constructor(private readonly budgetService: BudgetsService) {}

  // @Get('/')
  // @Roles(ERole.STAFF, ERole.MANAGER)
  // async getAllItemByTask(
  //   @Query() filter: FilterBigTaskAndItem,
  // ): Promise<unknown> {
  //   return await this.budgetService.getListBugdetForTask(filter);
  // }
  //
  // @Get('/:itemId')
  // async getItemTransaction(@Param('itemId') itemId: string): Promise<unknown> {
  //   return await this.budgetService.getTransactionOfItem(itemId);
  // }
  //
  // @Post('/:taskId/transaction-request')
  // @Roles(ERole.STAFF, ERole.EMPLOYEE)
  // async createNewTransaction(
  //   @Param('taskId') taskId: string,
  //   @Body() data: CreateTransactionRequest,
  //   @GetUser() user: string,
  // ): Promise<string> {
  //   return await this.budgetService.createTransaction(
  //     taskId,
  //     data,
  //     JSON.parse(user),
  //   );
  // }
}
