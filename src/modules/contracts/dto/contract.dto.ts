import { StringColorFormat } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { EContractPaymentMethod } from 'src/common/enum/enum';
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

  @IsNumberString()
  @ApiProperty({
    required: true,
    default: 10000000,
  })
  contractValue: number;

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
