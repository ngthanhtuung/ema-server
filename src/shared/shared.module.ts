import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule { }
