import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto, LoginGoogleRequest } from 'src/auth/dto/login.dto';
import { GetUser } from 'src/decorators/getUser.decorator';
import { Public } from 'src/decorators/public.decorator';
import { UserCreateRequest } from 'src/modules/user/dto/user.request';
import { PayloadUser } from 'src/modules/user/dto/user.response';
import ChangePasswordDto from './dto/changePassword.dto';
import SendCodeRequest from './dto/sendCode.dto';
import VerifyCodeRequest from './dto/verifyCode.dto';
import ForgetPasswordRequest from './dto/forgetPassword.dto';

@ApiBearerAuth()
@Controller('auth')
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthService) {}

  /**
   * http://localhost:6969/api/v1/auth/login(Post)
   * login
   * @param user
   * @returns
   */
  @Post('/login')
  @Public()
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Login successfully' })
  async login(
    @Body() data: LoginDto,
    @Res() res: Response,
  ): Promise<
    Response<
      {
        access_token: string;
        refresh_token: string;
      },
      Record<
        string,
        {
          access_token: string;
          refresh_token: string;
        }
      >
    >
  > {
    const dataUser = await this.authService.login(data.email, data.password);
    return res.status(HttpStatus.OK).send(dataUser);
  }

  /**
   *  http://localhost:6969/api/v1/auth/login-google(Post)
   * @param LoginGoogleRequest
   * @returns
   */
  @Post('/login-google')
  @Public()
  @ApiBody({ type: LoginGoogleRequest })
  @ApiOkResponse({ description: 'Login by Google successfully' })
  async loginGoogle(
    @Body() accessToken: LoginGoogleRequest,
    @Res() res: Response,
  ): Promise<
    Response<
      {
        access_token: string;
        refresh_token: string;
      },
      Record<
        string,
        {
          access_token: string;
          refresh_token: string;
        }
      >
    >
  > {
    const dataUser = await this.authService.loginGoogle(accessToken.token);
    return res.status(HttpStatus.OK).send(dataUser);
  }

  /**
   *  http://localhost:6969/api/v1/auth/sign-up(Post)
   * @param userRequest
   * @returns
   */
  @Public()
  @Post('sign-up')
  async signUp(@Body() userRequest: UserCreateRequest): Promise<string> {
    return await this.authService.signUp(userRequest);
  }

  @Get('me')
  getMe(@GetUser() user: string): PayloadUser {
    return JSON.parse(user);
  }

  /**
   * http://localhost:6969/api/v1/auth/change-password(Put)
   * changePassword
   * @param data
   * @param user
   * @returns
   */
  @Put('/change-password')
  async changePassword(
    @Body() data: ChangePasswordDto,
    @GetUser() user: string,
  ): Promise<string> {
    return await this.authService.changePassword(data, JSON.parse(user));
  }

  /**
   * sendCodeByEmail
   * @param account
   * @returns
   */
  @Post('/send-code')
  @Public()
  @ApiBody({ type: SendCodeRequest })
  @ApiOkResponse({ description: 'Send Code Successfully' })
  async sendCodeByEmail(@Body() account: SendCodeRequest): Promise<string> {
    return await this.authService.sendCodeByEmail(account?.email);
  }

  /**
   * verifyCode
   * @param account
   * @returns
   */
  @Post('/verify-code')
  @Public()
  @ApiBody({ type: VerifyCodeRequest })
  @ApiOkResponse({ description: 'Verify Code Successfully' })
  async verifyCode(@Body() account: VerifyCodeRequest): Promise<string> {
    return await this.authService.verifyCode(account?.email, account?.code);
  }

  /**
   * verifyCode
   * @param account
   * @returns
   */
  @Put('/forget-password')
  @Public()
  @ApiBody({ type: ForgetPasswordRequest })
  @ApiOkResponse({ description: 'Update password Successfully' })
  async forgetPassword(
    @Body() account: ForgetPasswordRequest,
  ): Promise<string> {
    return await this.authService.forgetPassword(
      account?.email,
      account?.password,
    );
  }
}
