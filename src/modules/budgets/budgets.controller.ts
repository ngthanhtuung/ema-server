import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import {
  CreateTransactionRequest,
  FilterBigTaskAndItem,
  FilterTransaction,
  TransactionRejectNote,
} from './dto/budget.request';
import { Roles } from '../../decorators/role.decorator';
import { ERole, ETransaction } from '../../common/enum/enum';
import { GetUser } from '../../decorators/getUser.decorator';
import { BudgetPagination } from './dto/budgets.pagination';
import { IPaginateResponse } from '../base/filter.pagination';
import { FilesInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { FileRequest } from '../../file/dto/file.request';
import { TransactionEvidenceEntity } from './transaction_evidence.entity';

@Controller('budget')
@ApiBearerAuth()
@ApiTags('Budget')
export class BudgetsController {
  constructor(private readonly budgetService: BudgetsService) {}

  @Get('/')
  @Roles(ERole.STAFF, ERole.MANAGER)
  async getAllItemByTask(
    @Query() filter: FilterBigTaskAndItem,
  ): Promise<unknown> {
    return await this.budgetService.getListBudgetForTask(filter);
  }

  @Get('/transaction-detail/:transactionId')
  @Roles(ERole.MANAGER, ERole.STAFF, ERole.EMPLOYEE)
  async getTranssactionDetail(
    @Param('transactionId') transactionId: string,
  ): Promise<unknown | undefined> {
    return await this.budgetService.getDetailTransactionById(transactionId);
  }

  @Get('/transaction-request')
  @Roles(ERole.MANAGER)
  @ApiQuery({
    name: 'type',
    type: 'enum',
    enum: ['OWN', 'ALL'],
  })
  async getAllRequest(
    @Query() filter: FilterBigTaskAndItem,
    @Query('type') type: string,
  ): Promise<unknown> {
    return await this.budgetService.getAllTransactionRequest(filter, type);
  }

  @Get('/own-transaction')
  @Roles(ERole.STAFF, ERole.EMPLOYEE)
  async getOwnTransaction(
    @Query() transactionPagination: BudgetPagination,
    @Query() filter: FilterTransaction,
    @GetUser() user: string,
  ): Promise<IPaginateResponse<unknown>> {
    return await this.budgetService.getOwnRequest(
      transactionPagination,
      filter,
      JSON.parse(user),
    );
  }

  @Get('/:itemId')
  async getItemTransaction(@Param('itemId') itemId: string): Promise<unknown> {
    return await this.budgetService.getTransactionOfItem(itemId, true);
  }

  @Post('/:taskId/transaction-request')
  @Roles(ERole.STAFF, ERole.EMPLOYEE)
  async createNewTransaction(
    @Param('taskId') taskId: string,
    @Body() data: CreateTransactionRequest,
    @GetUser() user: string,
  ): Promise<string> {
    return await this.budgetService.createTransaction(taskId, data, user);
  }

  @Put('/update-status-transaction/:transactionId')
  @Roles(ERole.MANAGER, ERole.STAFF)
  @ApiQuery({
    name: 'status',
    type: 'enum',
    enum: [ETransaction.ACCEPTED, ETransaction.REJECTED, ETransaction.SUCCESS],
  })
  @ApiBody({
    type: TransactionRejectNote,
    required: false,
  })
  async updateStatusTransaction(
    @Param('transactionId') transactionId: string,
    @Query('status') status: ETransaction,
    @GetUser() user: string,
    @Body() rejectNote?: TransactionRejectNote,
  ): Promise<string> {
    return await this.budgetService.updateStatusTransaction(
      transactionId,
      status,
      user,
      rejectNote,
    );
  }

  @Get('/:transactionId/evidence')
  @Roles(ERole.MANAGER, ERole.STAFF, ERole.EMPLOYEE)
  async getEvidenceByContractId(
    @Param('transactionId') transactionId: string,
  ): Promise<TransactionEvidenceEntity[]> {
    return await this.budgetService.getEvidenceByTransactionId(transactionId);
  }

  @Post('/:transactionId/evidence')
  @ApiConsumes('multipart/form-data')
  @Roles(ERole.STAFF, ERole.EMPLOYEE)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  async updateContractEvidence(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('transactionId') transactionId: string,
    @GetUser() user: string,
  ): Promise<unknown | undefined> {
    const fileDtos = files.map((file) =>
      plainToInstance(FileRequest, {
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        fileBuffer: file.buffer,
      }),
    );
    return await this.budgetService.updateContractEvidence(
      transactionId,
      fileDtos,
      JSON.parse(user),
    );
  }

  @Put('/:transactionId/update-budget-percentage')
  @Roles(ERole.MANAGER)
  @ApiQuery({
    name: 'amount',
    required: true,
    type: 'number',
  })
  async updateItemPercentage(
    @Param('transactionId') transactionId: string,
    @Query('amount') amount: number,
    @GetUser() user: string,
  ): Promise<unknown> {
    return await this.budgetService.updateItemPercentage(
      transactionId,
      amount,
      user,
    );
  }

  @Delete('/:transactionId')
  @Roles(ERole.MANAGER, ERole.STAFF, ERole.EMPLOYEE)
  async deleteTransaction(
    @Param('transactionId') transactionId: string,
    @GetUser() user: string,
  ): Promise<string> {
    return await this.budgetService.deleteTransaction(transactionId, user);
  }
}
