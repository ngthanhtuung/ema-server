import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @ApiProperty({ default: 'tien@yahoo.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ default: '123' })
  password: string;
}
