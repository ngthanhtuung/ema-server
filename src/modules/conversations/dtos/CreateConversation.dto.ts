import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  @ApiProperty({ default: 'huydoanmec@gmail.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ default: 'test create' })
  message: string;
}
