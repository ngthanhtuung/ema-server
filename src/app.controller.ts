/* eslint-disable @typescript-eslint/no-explicit-any */
import { FirebaseMessageService } from './providers/firebase/message/firebase-message.service';
import {
  Controller,
  InternalServerErrorException,
  Get,
  Query,
  Body,
  Post,
  Req,
  Render,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import * as firebaseAdmin from 'firebase-admin';
import { AuthService } from './auth/auth.service';
import { LoginGoogleRequest } from './auth/dto/login.dto';
import { SharedService } from './shared/shared.service';
import { JwtService } from '@nestjs/jwt';
import { ETypeEmployee } from './common/enum/enum';

@Controller()
@ApiTags('TESTING API')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly firebaseMessageService: FirebaseMessageService,
    private readonly authService: AuthService,
    private readonly sharedService: SharedService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('/customer_contract_info')
  @Render('customer_contract_info')
  @Public()
  async renderCustomerContractInfo(@Query() token: string): Promise<any> {
    try {
      console.log('Token: ', token);
      const payload = this.jwtService.decode(token);
      return payload;
    } catch (error) {
      console.error('Error fetching data:', error);
      return { error: 'Failed to fetch data' }; // Return an error message or handle the error accordingly
    }
  }

  @Post('/test-notification')
  @Public()
  async testNotification(
    @Body() deviceToken: string[],
  ): Promise<any | undefined> {
    try {
      const deviceTokenArray = deviceToken;
      let result = null;
      result = firebaseAdmin.messaging().sendEachForMulticast({
        tokens: deviceTokenArray,
        notification: {
          title: 'Test thử notification',
          body: 'test thử noti',
        },
      });

      return result;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  @Post('/test-login-google')
  @Public()
  async testLoginGoogle(
    @Body() accessToken: LoginGoogleRequest,
  ): Promise<unknown> {
    try {
      return await this.authService.loginGoogle(accessToken.token);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  // @Get('/test-generate-employee-code')
  // @Public()
  // @ApiQuery({
  //   name: 'typeEmployee',
  //   required: true,
  //   type: 'enum',
  //   enum: ETypeEmployee,
  // })
  // async testGenerateEmployeeCode(
  //   @Query('typeEmployee') typeEmployee: string,
  // ): Promise<unknown | undefined> {
  //   return await this.sharedService.generateUserCode(typeEmployee);
  // }
}
