import { FirebaseMessageService } from './providers/firebase/message/firebase-message.service';
import {
  Controller,
  InternalServerErrorException,
  Get,
  Param,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';

@Controller()
@ApiTags('TESTING API')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly firebaseMessageService: FirebaseMessageService,
  ) {}

  // @Get('test-notification/')
  // @Public()
  // async testNotification(
  //   // @Param('deviceToken') deviceToken: string
  // ): Promise<any | undefined> {
  //   try {
  //     let deviceTokenArray = ['123']
  //     const result = await this.firebaseMessageService.sendCustomNotification(
  //       deviceTokenArray,
  //       'hahahaha',
  //       'test thử noti',
  //       { test: 'test' }
  //     )
  //     console.log('Result: ', result.responses)
  //   } catch (err) {
  //     throw new InternalServerErrorException(err.message)
  //   }
  // }
}
