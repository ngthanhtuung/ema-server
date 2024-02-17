import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { FilterPaginationBase } from 'src/modules/base/filter.pagination';

export class MessagesPagination extends OmitType(FilterPaginationBase, [
  'currentPage',
]) {
  @ApiProperty({
    type: String,
    description: 'StartKey of Message',
    required: false,
  })
  @IsOptional()
  startKey?: string;
}
