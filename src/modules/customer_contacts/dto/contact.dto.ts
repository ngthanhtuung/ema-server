import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
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
  @ApiProperty({
    required: true,
    default: 'Nguyễn Văn A',
  })
  fullName: string;

  @IsString()
  @ApiProperty({
    required: true,
    default: 'Nhà Văn Hóa Sinh Viên ĐHQG TPHCM',
  })
  address: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    default: 'nguyenvana@gmail.com',
  })
  email: string;

  @IsString()
  @ApiProperty({
    required: true,
    default: '0123456789',
  })
  phoneNumber: string;

  @ApiProperty()
  note: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  eventTypeId: string;
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
