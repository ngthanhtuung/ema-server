import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import * as moment from 'moment';
import { EGender } from 'src/common/enum/enum';

export class AccountCreateRequest {
  @ApiProperty({ default: 'bao@gmail.com' })
  email: string;

  @ApiProperty({ default: '123' })
  password: string;

  @ApiProperty({ default: '12345678' })
  phoneNumber: string;

  @ApiProperty({ default: 'test' })
  fullName: string;

  @ApiProperty({ default: new Date() })
  @Transform(({ value }) => {
    console.log(moment(value).format('YYYY-MM-DD'));

    return moment(value).format('YYYY-MM-DD');
  })
  dob: Date;

  @ApiProperty({ default: '121212' })
  nationalId: string;

  @ApiProperty({ default: EGender.MALE, enum: EGender })
  gender: EGender;

  @ApiProperty({ default: 'abc test' })
  address: string;

  @ApiProperty({ default: 'test' })
  avatar: string;
}
