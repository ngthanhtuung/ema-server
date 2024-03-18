import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNumber, IsString } from 'class-validator';

export class ItemArrayRequest {
  @ApiProperty()
  @IsString()
  itemName: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsInt()
  priority: number;

  @ApiProperty()
  @IsNumber({ allowNaN: false })
  plannedAmount: number;

  @ApiProperty()
  plannedPrice: number;

  @ApiProperty()
  @IsString()
  plannedUnit: string;
}

export class CreateItemRequest {
  @ApiProperty({ required: true })
  @IsString()
  categoryName: string;

  @ApiProperty({
    type: [ItemArrayRequest],
    required: true,
  })
  @IsArray()
  items: ItemArrayRequest[];
}

export class UpdatePlanRequest extends CreateItemRequest {}

export class UpdateItemRequest extends ItemArrayRequest {
  @ApiProperty()
  @IsString()
  categoryName: string;
}
