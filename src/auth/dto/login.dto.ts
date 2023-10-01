import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @ApiProperty({ default: 'tungntse151167@fpt.edu.vn' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ default: 'RXx#xRvR' })
  password: string;
}
