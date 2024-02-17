import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUTH_ERROR_MESSAGE } from 'src/common/constants/constants';
import { EUserStatus } from 'src/common/enum/enum';
import { jwtConstants } from 'src/config/jwt.config';
import { UserService } from 'src/modules/user/user.service';
import {
  CustomerCreateRequest,
  UserCreateRequest,
} from 'src/modules/user/dto/user.request';
import { SharedService } from 'src/shared/shared.service';
import ChangePasswordDto from './dto/changePassword.dto';
import { UserEntity } from 'src/modules/user/user.entity';
import * as moment from 'moment-timezone';
import * as firebaseAdmin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private sharedService: SharedService,
  ) {}

  /**
   * login-service
   * @param email
   * @param password
   * @returns
   */
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
    if (!user || !isMatch) {
      throw new BadRequestException('Sai email hoặc mật khẩu !!!');
    }
    const payload = {
      id: user?.id || '',
      role: user?.role || '',
      email: email,
      divisionID: user?.divisionId || '',
      avatar: user?.avatar || '',
      fullName: user?.fullName || '',
      typeEmployee: user?.typeEmployee || '',
    };
    // Create accessToken
    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConstants.accessTokenSecret,
      expiresIn: '1d',
    });
    // Create refreshToken
    const refreshToken = this.jwtService.sign(
      { id: payload.id },
      {
        secret: jwtConstants.refreshTokenSecret,
        expiresIn: '60days',
      },
    );
    await this.userService.updateRefreshToken(user.id, refreshToken);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * signUp
   * @param userRequest
   * @returns
   */
  async signUp(userRequest: UserCreateRequest): Promise<string> {
    return await this.userService.insertUser(userRequest);
  }

  /**
   * signUp
   * @param customerRequest
   * @returns
   */
  async signUpCustomer(
    customerRequest: CustomerCreateRequest,
  ): Promise<string> {
    return await this.userService.insertCustomer(customerRequest);
  }

  /**
   * changePassword
   * @param data
   * @param user
   * @returns
   */
  async changePassword(
    data: ChangePasswordDto,
    user: UserEntity,
  ): Promise<string> {
    try {
      const loginUser = await this.userService.findByEmail(user.email);
      const { oldPassword, newPassword, confirmPassword } = data;
      if (newPassword !== confirmPassword) {
        throw new BadRequestException('Confirm password is not match');
      }
      const checkPassword = await this.sharedService.comparePassword(
        oldPassword,
        loginUser.password,
      );
      if (!checkPassword) {
        throw new BadRequestException('Old password is not match');
      }
      const hashPassword = await this.sharedService.hashPassword(newPassword);
      const currentDate = moment().tz('Asia/Ho_Chi_Minh').toDate();
      await this.userService.updatePassword(
        hashPassword,
        currentDate,
        loginUser.id,
      );
      return 'Change password successfully';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * sendCodeByEmail
   * @param email
   * @returns
   */
  async sendCodeByEmail(email: string): Promise<string> {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new BadRequestException("Account don't exist");
      }
      // generate code
      const code = this.sharedService.generateUniqueRandomNumber();
      // time current
      const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
      // update code and issueDate
      await this.userService.updateCodeAndIssueDate(
        user?.id,
        code,
        currentTime,
      );
      // send code email
      await this.sharedService.sendCodeEmail(email, code);
      return 'Send Code Successfully';
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * verifyCode
   * @param email
   * @param code
   * @returns
   */
  async verifyCode(email: string, code: string): Promise<string> {
    try {
      const user = await this.userService.getAuthCodeAndIssueDate(email);
      if (!user) {
        throw new BadRequestException("Account don't exist");
      }
      const issueDateFormat = moment(user.issueDate).format(
        'YYYY-MM-DD HH:mm:ss',
      );
      const issueDateAfter10Minutes = moment(user.issueDate)
        .add(10, 'minutes')
        .format('YYYY-MM-DD HH:mm:ss');
      const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
      const checkTime = moment(currentTime).isBetween(
        issueDateFormat,
        issueDateAfter10Minutes,
      );
      if (!checkTime) {
        throw new BadRequestException('The authCode has expired!! ');
      }
      if (code !== user.authCode) {
        throw new BadRequestException("The authCode hasn't match!! ");
      }
      return 'Verify successfully';
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * verifyCode
   * @param email
   * @param password
   * @returns
   */
  async forgetPassword(email: string, password: string): Promise<string> {
    try {
      const loginUser = await this.userService.findByEmail(email);
      if (!loginUser) {
        throw new BadRequestException("Account don't exist");
      }
      const hashPassword = await this.sharedService.hashPassword(password);
      const currentDate = moment().tz('Asia/Ho_Chi_Minh').toDate();
      await this.userService.updatePassword(
        hashPassword,
        currentDate,
        loginUser.id,
      );
      return 'Update password successfully!!';
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async loginGoogle(
    token: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const decode = await firebaseAdmin.auth().verifyIdToken(token);
      const { email } = decode;
      const userInfo = await firebaseAdmin.auth().getUserByEmail(email);
      let user = await this.userService.findByEmail(email);
      if (!user) {
        const payload: UserCreateRequest = {
          email: userInfo.email,
          phoneNumber: userInfo.phoneNumber,
          fullName: userInfo.displayName,
          avatar: userInfo.photoURL,
        };
        await this.signUp(payload);
        user = await this.userService.findByEmail(email);
      }
      if (user.status === EUserStatus.INACTIVE) {
        throw new BadRequestException(AUTH_ERROR_MESSAGE.USER_NOT_VERIFY);
      }
      const payload = {
        id: user?.id,
        role: user?.role,
        email: email,
        divisionID: user?.divisionId || '',
        avatar: user?.avatar || '',
        fullName: user?.fullName || '',
        typeEmployee: user?.typeEmployee || '',
      };
      // Create accessToken
      const accessToken = this.jwtService.sign(payload, {
        secret: jwtConstants.accessTokenSecret,
        expiresIn: '1d',
      });
      // Create refreshToken
      const refreshToken = this.jwtService.sign(
        { id: payload.id },
        {
          secret: jwtConstants.refreshTokenSecret,
          expiresIn: '60days',
        },
      );
      await this.userService.updateRefreshToken(user.id, refreshToken);
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
