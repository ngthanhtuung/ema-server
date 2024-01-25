import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  EContactInformation,
  EUserStatus,
  SortEnum,
} from 'src/common/enum/enum';
import { CustomerContactEntity } from '../customer_contacts.entity';

export class CustomerContactRequest {
  @IsString()
  @ApiProperty()
  fullName: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  note: string;
}

export class ProcessBy {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  avatar: string;
  status: EUserStatus;
}

export class CustomerContactResponse extends CustomerContactRequest {
  @IsString()
  @ApiProperty()
  id: string;

  @ApiProperty()
  processBy: ProcessBy;

  @IsDateString()
  @ApiProperty()
  createdAt: Date;

  @IsEnum(CustomerContactEntity)
  @ApiProperty()
  status: EContactInformation;

  @IsOptional()
  @IsString()
  rejectNote?: string;
}

export class FilterCustomerContact {
  @IsString()
  @ApiProperty({
    required: false,
    default: 'createdAt',
  })
  sortProperty: string;

  @ApiProperty({
    type: 'enum',
    enum: SortEnum,
    required: false,
    default: SortEnum.ASC,
  })
  sort: SortEnum;

  @ApiProperty({
    required: false,
    type: 'enum',
    enum: EContactInformation,
    default: EContactInformation.PENDING,
  })
  status: EContactInformation;
}

export class RejectNote {
  @IsOptional()
  @IsString()
  @ApiProperty()
  rejectNote?: string;
}
