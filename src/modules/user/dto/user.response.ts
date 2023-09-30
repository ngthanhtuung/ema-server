import { OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { EUserStatus } from 'src/common/enum/enum';

export class UserResponse {
  @Expose()
  id: string;

  @Expose()
  role: string;

  @Expose()
  password: string;

  @Expose()
  status: EUserStatus;
}

export class PayloadUser extends OmitType(UserResponse, ['password']) {
  @Expose()
  fullName: string;
}
