import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { EStatusBudgets, SortEnum } from 'src/common/enum/enum';

export class BudgetsResponse {
  @Expose()
  id: string;

  @Expose()
  budgetName: string;

  @Expose()
  estExpense: number;

  @Expose()
  realExpense: string;

  @Expose()
  status: EStatusBudgets;

  @Expose()
  eventID: string;

  @Expose()
  createBy: string;

  @Expose()
  createAt: Date;

  @Expose()
  approveBy: string;

  @Expose()
  approveDate: Date;

  @Expose()
  urlImage: string;

  @Expose()
  supplier: string;
}

export class FilterBudgets {
  @ApiProperty({ required: false, default: 'test' })
  eventName: string;

  @ApiProperty({ required: false, default: '2023-10' })
  monthYear: string;

  @ApiProperty({
    type: 'string',
    required: false,
    default: 'startDate',
  })
  nameSort: string;

  @ApiProperty({
    type: 'enum',
    enum: SortEnum,
    required: false,
  })
  sort: SortEnum;

  @ApiProperty({
    required: false,
    type: 'enum',
    enum: EStatusBudgets,
  })
  status: EStatusBudgets;
}
