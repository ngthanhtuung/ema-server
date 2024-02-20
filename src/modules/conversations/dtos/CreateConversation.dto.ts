import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  @ApiProperty({ default: 'huydoanmec@gmail.com' })
  email: string;

  @ApiProperty({ default: 'test create' })
  @Optional()
  message?: string;
}
