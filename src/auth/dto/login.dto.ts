import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @ApiProperty({ default: 'huydoanmec@gmail.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ default: '123456' })
  password: string;
}

export class LoginGoogleRequest {
  @IsString()
  @ApiProperty()
  token: string;
}
