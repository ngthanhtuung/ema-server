import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUTH_ERROR_MESSAGE } from 'src/common/constants/constants';
import { EUserStatus } from 'src/common/enum/enum';
import { jwtConstants } from 'src/config/jwt.config';
import { UserService } from 'src/modules/user/user.service';
import { UserCreateRequest } from 'src/modules/user/dto/user.request';
import { SharedService } from 'src/shared/shared.service';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private sharedService: SharedService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new BadRequestException(AUTH_ERROR_MESSAGE.USER_NOT_EXIST);
    }

    if (user.status === EUserStatus.INACTIVE) {
      throw new BadRequestException(AUTH_ERROR_MESSAGE.USER_NOT_VERIFY);
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
      // Create accessToken
      const accessToken = this.jwtService.sign(payload, {
        secret: jwtConstants.accessTokenSecret,
        expiresIn: '3d',
      });
      // Create refreshToken
      const refreshToken = this.jwtService.sign(
        { id: payload.id },
        {
          secret: jwtConstants.refreshTokenSecret,
          expiresIn: '60days',
        },
      );
      this.userService.updateRefreshToken(user.id, refreshToken);
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    }
  }

  async signUp(userRequest: UserCreateRequest): Promise<string> {
    return await this.userService.insertUser(userRequest);
  }
}
