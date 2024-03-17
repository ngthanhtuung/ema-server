import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
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

  @IsString()
  @ApiProperty({ default: 'Test desc' })
  eventID?: string;

  @IsString()
  @ApiProperty({ default: 'Test desc' })
  parentTaskId?: string;

  @IsString()
  @ApiProperty({ default: 'Test desc' })
  commonId?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Test desc' })
  avatar: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Test desc' })
  messageSocket: string;

  @IsEnum(ETypeNotification)
  @IsNotEmpty()
  @ApiProperty({ default: ETypeNotification.TASK })
  type: ETypeNotification;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @ApiProperty({ type: [String], default: ['string'] })
  userIdAssignee?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @ApiProperty({ type: [String], default: ['string'] })
  userIdTaskMaster?: string[];
}

export class NotificationContractRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Sự kiện 10 năm thành lập FBT' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Test desc' })
  content: string;

  @IsString()
  @ApiProperty({ default: 'Test desc' })
  commonId?: string;

  @IsString()
  @ApiProperty({ default: 'Test desc' })
  contractId?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Test desc' })
  avatar: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Test desc' })
  messageSocket: string;

  @IsEnum(ETypeNotification)
  @IsNotEmpty()
  @ApiProperty({ default: ETypeNotification.CONTRACT })
  type: ETypeNotification;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  receiveUser: string;
}
