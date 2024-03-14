import { StringColorFormat } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  EContactInformation,
  EContractPaymentMethod,
  EContractStatus,
} from 'src/common/enum/enum';

export class ContractCreateRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    default: 'Nguyễn Văn A',
  })
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    default: '123456789',
  })
  customerNationalId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    default: 'Thành Phố Thủ Dầu Một, Bình Dương',
  })
  customerAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    default: 'nguyenvana@gmail.com',
  })
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    default: '0987654321',
  })
  customerPhoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    default: '10000000',
  })
  contractValue: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: 'enum',
    enum: EContractPaymentMethod,
    default: EContractPaymentMethod.CASH,
  })
  paymentMethod: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    default: '2021-10-10',
  })
  paymentDate: string;
}

export class ContractRejectNote {
  @IsOptional()
  @IsString()
  @ApiProperty()
  rejectNote?: string;
}

export class FilterContract {
  @ApiProperty({
    required: false,
    type: 'enum',
    enum: EContractStatus,
    default: EContractStatus.ALL,
  })
  status: EContractStatus;
}
