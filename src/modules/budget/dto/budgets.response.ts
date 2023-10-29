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
  approveBy: string;

  @Expose()
  approvedDate: Date;

  @Expose()
  urlImage: string;

  @Expose()
  supplier: string;

  @Expose()
  userName: string;
}
