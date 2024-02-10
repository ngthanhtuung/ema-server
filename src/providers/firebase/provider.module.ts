import { Module } from '@nestjs/common';
import { FirebaseMessageService } from './message/firebase-message.service';
import { DeviceModule } from '../../modules/device/device.module';

@Module({
  imports: [DeviceModule],
  providers: [FirebaseMessageService],
  exports: [FirebaseMessageService],
})
export class FirebaseProviderModule {}
