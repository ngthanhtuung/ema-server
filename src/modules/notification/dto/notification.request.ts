import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
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

  @IsEnum(ETypeNotification)
  @IsNotEmpty()
  @ApiProperty({ default: ETypeNotification.TASK })
  type: ETypeNotification;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @ApiProperty({ type: [String], default: ['string'] })
  userId: string[];
}
