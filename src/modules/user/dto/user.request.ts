import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import * as moment from 'moment';
import { EGender, ERole, EUserStatus } from 'src/common/enum/enum';
import { FilterPaginationBase } from 'src/modules/base/filter.pagination';

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

  @IsNotEmpty()
  @ApiProperty({})
  divisionId: string;

  @ApiProperty({ default: ERole.EMPLOYEE, enum: ERole })
  @IsEnum(ERole)
  role: ERole;
}

export class UserPagination extends FilterPaginationBase {}

export class UserProfileUpdateRequest extends OmitType(UserCreateRequest, [
  'email',
  'nationalId',
  'gender',
  'divisionId',
]) {}

export class UserProfileUpdateRequestV2 extends UserCreateRequest {
  @IsNotEmpty()
  @ApiProperty({
    default: EUserStatus.ACTIVE,
  })
  status: EUserStatus;
}
