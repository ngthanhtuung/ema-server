import { FirebaseMessageService } from './providers/firebase/message/firebase-message.service';
import { Controller, InternalServerErrorException, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';

@Controller()
@ApiTags('TESTING API')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly firebaseMessageService: FirebaseMessageService
  ) { }

  @Get('test-notification/')
  @Public()
  async testNotification(
    // @Param('deviceToken') deviceToken: string
  ): Promise<any | undefined> {
    try {
      let deviceTokenArray = ['fg4PB7SAT4iGYqh9JOad8r:APA91bGv4strxxn0fp2BMcIJ_hx_OUvaU3znrqkAiMCixWqsrxVjkPyei2YheiUdc-3L5UpjWE6F7xKhkRKHRUkWGj_cS0Wa9dKlwMrlYarHWsjaB3HGLwNcgKXriox7nji3dCOEXkb5']
      const result = await this.firebaseMessageService.sendCustomNotification(
        deviceTokenArray,
        'hahahaha',
        'test thử noti',
        { test: 'test' }
      )
      console.log('Result: ', result)
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }
}
