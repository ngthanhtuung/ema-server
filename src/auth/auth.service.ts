import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUTH_ERROR_MESSAGE } from 'src/common/constants/constants';
import { EAccountStatus } from 'src/common/enum/enum';
import { AccountService } from 'src/modules/account/account.service';
import { AccountCreateRequest } from 'src/modules/account/dto/account.request';
import { SharedService } from 'src/shared/shared.service';
@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
    private jwtService: JwtService,
    private sharedService: SharedService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.accountService.findByEmail(email);

    if (!user) {
      throw new BadRequestException(AUTH_ERROR_MESSAGE.ACCOUNT_NOT_EXIST);
    }

    if (user.status === EAccountStatus.INACTIVE) {
      throw new BadRequestException(AUTH_ERROR_MESSAGE.ACCOUNT_NOT_VERIFY);
    }

    const isMatch = await this.sharedService.comparePassword(
      password,
      user.password,
    );

    if (user && isMatch) {
      const payload = {
        id: user.id,
        role: user.role,
      };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
  }

  async signUp(accountRequest: AccountCreateRequest) {
    return await this.accountService.insertAccount(accountRequest);
  }
}
