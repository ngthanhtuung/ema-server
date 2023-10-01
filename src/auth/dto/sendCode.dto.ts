import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export default class SendCodeRequest {
  @IsNotEmpty()
  @ApiProperty({ default: 'huydoanmec@gmail.com' })
  email: string;
}
