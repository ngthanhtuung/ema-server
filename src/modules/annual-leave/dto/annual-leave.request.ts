import { ApiProperty } from '@nestjs/swagger';

const currentYear = new Date().getFullYear();
export class AnnualLeaveGetRequest {
  @ApiProperty({ default: currentYear, required: false })
  year: number;
}
