import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsString,
  IsDecimal,
  IsOptional,
} from 'class-validator';
import { FilterTask } from '../../task/dto/task.request';
import {
  EContractStatus,
  ETransaction,
  SortEnum,
} from '../../../common/enum/enum';

export class CreatePlanBudgetRequest {
  @ApiProperty()
  @IsNumber({ allowNaN: false })
  plannedAmount: number;

  @ApiProperty()
  @IsDecimal()
  plannedPrice: number;

  @ApiProperty()
  @IsString()
  plannedUnit: string;

  @ApiProperty()
  @IsString()
  description: string;
}

export class CreateTransactionRequest {
  @IsString()
  @ApiProperty()
  transactionName: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  amount: number;
}

export class FilterBigTaskAndItem extends FilterTask {}

export class TransactionRejectNote {
  @IsOptional()
  @IsString()
  @ApiProperty()
  rejectNote?: string;
}

export class FilterTransaction {
  @IsString()
  @ApiProperty({
    required: false,
    default: 'createdAt',
  })
  sortProperty: string;

  @ApiProperty({
    type: 'enum',
    enum: SortEnum,
    required: false,
    default: SortEnum.ASC,
  })
  sort: SortEnum;

  @ApiProperty({
    required: false,
    type: 'enum',
    enum: ETransaction,
    default: ETransaction.ALL,
  })
  status: ETransaction;
}
