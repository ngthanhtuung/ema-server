import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, IsDecimal } from 'class-validator';

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

export class CreateTransactionRequest {}
