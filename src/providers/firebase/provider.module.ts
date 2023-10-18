import { Module } from '@nestjs/common';
import { FirebaseMessageService } from './message/firebase-message.service';

@Module({
  imports: [],
  providers: [FirebaseMessageService],
  exports: [FirebaseMessageService],
})
export class FirebaseProviderModule {}
