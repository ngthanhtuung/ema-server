import { CreatePlanBudgetRequest } from '../../budgets/dto/budget.request';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject, IsString } from 'class-validator';

export class ItemArrayRequest {
  @ApiProperty()
  @IsString()
  itemName: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsObject()
  budget: CreatePlanBudgetRequest;
}

export class CreateItemRequest {
  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty({
    type: [ItemArrayRequest],
    required: true,
  })
  @IsArray()
  items: ItemArrayRequest[];
}
