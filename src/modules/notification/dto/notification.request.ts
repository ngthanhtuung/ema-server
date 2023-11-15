import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ETypeNotification } from 'src/common/enum/enum';

export class NotificationCreateRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Sự kiện 10 năm thành lập FBT' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Test desc' })
  content: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ default: false })
  readFlag: boolean;

  @IsEnum(ETypeNotification)
  @IsNotEmpty()
  @ApiProperty({ default: ETypeNotification.TASK })
  type: ETypeNotification;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'string' })
  sender: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'string' })
  commonId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'string' })
  parentTaskId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'string' })
  eventId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'string' })
  userId: string;
}
