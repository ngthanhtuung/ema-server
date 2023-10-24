import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { EStatusBudgets, SortEnum } from 'src/common/enum/enum';

export class BudgetsCreateRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'string' })
  eventID: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Tiền thuê mic' })
  budgetName: string;

  @IsNotEmpty()
  @ApiProperty({ default: 200000 })
  estExpense: number;

  @IsNotEmpty()
  @ApiProperty({ default: 400000 })
  realExpense: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Thuê sảnh từ 8h00 - 12h00 ' })
  description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    default: 'string',
  })
  createBy: string;

  @ApiProperty({ default: 'url image hóa đơn' })
  urlImage: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Saigon LED' })
  supplier: string;
}

export class BudgetsUpdateRequest extends OmitType(BudgetsCreateRequest, [
  'createBy',
]) {}
