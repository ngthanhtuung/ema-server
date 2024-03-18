import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, IsDecimal } from 'class-validator';
import { FilterTask } from '../../task/dto/task.request';

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
