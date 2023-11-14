/* eslint-disable @typescript-eslint/no-explicit-any */
import { FirebaseMessageService } from './providers/firebase/message/firebase-message.service';
import {
  Controller,
  InternalServerErrorException,
  Get,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';

@Controller()
@ApiTags('TESTING API')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly firebaseMessageService: FirebaseMessageService,
  ) {}

  @Get('/test-notification')
  @ApiQuery({
    name: 'deviceToken',
    isArray: true,
    type: String,
  })
  @Public()
  async testNotification(
    @Query('deviceToken') deviceToken: string[],
  ): Promise<any | undefined> {
    try {
      const deviceTokenArray = deviceToken;
      const result = await this.firebaseMessageService.sendCustomNotification(
        deviceTokenArray,
        'Test thử notification',
        'test thử noti',
        { test: 'test' },
      );
      return result;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
