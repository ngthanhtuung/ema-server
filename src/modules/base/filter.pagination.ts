import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FilterPaginationBase {
  @ApiProperty({
    type: String,
    description: 'Size of page',
    default: '10',
    required: false,
  })
  @Transform(({ value }) => {
    return Number(value);
  })
  sizePage = 10;

  @ApiProperty({
    type: String,
    description: 'Current page',
    default: '1',
    required: false,
  })
  @Transform(({ value }) => {
    return Number(value);
  })
  currentPage = 1;
}

export class IPaginateResponse<T> {
  currentPage: number;
  nextPage: number;
  prevPage: number;
  lastPage: number;
  totalItems: number;
  data: T;
}

export function paginateResponse<T>(
  data: [T, number],
  page: number,
  limit: number,
): IPaginateResponse<T> {
  const [result, total]: [T, number] = data;
  page = +page;
  const lastPage: number = Math.ceil(total / limit);
  const nextPage: number = page + 1 > lastPage ? null : page + 1;
  const prevPage: number = page - 1 < 1 ? null : page - 1;
  return {
    currentPage: page,
    nextPage: nextPage,
    prevPage: prevPage,
    lastPage: lastPage,
    totalItems: total,
    data: result,
  };
}
