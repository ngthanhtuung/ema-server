import { OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { EAccountStatus } from 'src/common/enum/enum';

export class AccountResponse {
  @Expose()
  id: string;

  @Expose()
  role: string;

  @Expose()
  password: string;

  @Expose()
  status: EAccountStatus;
}

export class PayloadAccount extends OmitType(AccountResponse, ['password']) {
  @Expose()
  fullName: string;
}
