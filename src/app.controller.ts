/* eslint-disable @typescript-eslint/no-explicit-any */
import { FirebaseMessageService } from './providers/firebase/message/firebase-message.service';
import {
  Controller,
  InternalServerErrorException,
  Get,
  Query,
  Body,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import * as firebaseAdmin from 'firebase-admin';

@Controller()
@ApiTags('TESTING API')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly firebaseMessageService: FirebaseMessageService,
  ) {}

  @Post('/test-notification')
  // @ApiBody({
  //   type: String,
  //   isArray: true,
  // })
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
}
