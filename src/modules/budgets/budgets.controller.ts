import {
  Body,
  Controller,
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
    return await this.budgetService.getListBugdetForTask(filter);
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
    return await this.budgetService.getTransactionOfItem(itemId);
  }

  @Post('/:taskId/transaction-request')
  @Roles(ERole.STAFF, ERole.EMPLOYEE)
  async createNewTransaction(
    @Param('taskId') taskId: string,
    @Body() data: CreateTransactionRequest,
    @GetUser() user: string,
  ): Promise<string> {
    return await this.budgetService.createTransaction(
      taskId,
      data,
      JSON.parse(user),
    );
  }

  @Put('/update-status-transaction/:transactionId')
  @Roles(ERole.MANAGER, ERole.STAFF)
  @ApiQuery({
    name: 'status',
    type: 'enum',
    enum: [ETransaction.ACCEPTED, ETransaction.REJECTED],
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
      JSON.parse(user),
      rejectNote,
    );
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
}
