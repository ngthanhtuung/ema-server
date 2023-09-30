import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import * as moment from 'moment';
import { EGender } from 'src/common/enum/enum';

export class UserCreateRequest {
  @ApiProperty({ default: 'bao@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ default: '12345678' })
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ default: 'test' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ default: new Date() })
  @Transform(({ value }) => {
    return moment(value).format('YYYY-MM-DD');
  })
  dob: Date;

  @ApiProperty({ default: '121212' })
  @IsNotEmpty()
  nationalId: string;

  @ApiProperty({ default: EGender.MALE, enum: EGender })
  @IsEnum(EGender)
  gender: EGender;

  @ApiProperty({ default: 'abc test' })
  @IsNotEmpty()
  address: string;

  @ApiProperty({ default: 'test' })
  @IsNotEmpty()
  avatar: string;
}
