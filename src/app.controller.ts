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
import * as FCM from 'fcm-node';
import axios from 'axios';

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
      // const bodyData = {
      //   to: deviceTokenArray,
      //   notification: {
      //     title: 'Test thử notification',
      //     body: 'test thử noti',
      //   },
      // };
      // const response = await axios.post(
      //   'https://fcm.googleapis.com/fcm/send',
      //   bodyData,
      //   {
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Authorization:
      //         'key=AAAA5v_Nyvc:APA91bH3at_UJGufAa028KkD2SdEjd4xd_2z-FDFOVezg-pz0esyyK9KTa_CuajshHEMMGnfnAT20n2FjL4K8Zc8ijLpVnEyJC3KFl9dw3MOLCaAz_Xm1E9vPNuNDnf8pBfdezGNw7Ic',
      //     },
      //   },
      // );
      // const response = await axios.post(
      //   'https://fcm.googleapis.com/fcm/send',
      //   {
      //     to: deviceTokenArray,
      //     notification: {
      //       title: 'Test thử notification',
      //       body: 'test thử noti',
      //     },
      //   },
      //   {
      //     headers: {
      //       Authorization:
      //         'key=AAAA5v_Nyvc:APA91bH3at_UJGufAa028KkD2SdEjd4xd_2z-FDFOVezg-pz0esyyK9KTa_CuajshHEMMGnfnAT20n2FjL4K8Zc8ijLpVnEyJC3KFl9dw3MOLCaAz_Xm1E9vPNuNDnf8pBfdezGNw7Ic',
      //       'Content-Type': 'application/json', // Adjust content type as needed
      //     },
      //   },
      // );
      // return response.data;
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
