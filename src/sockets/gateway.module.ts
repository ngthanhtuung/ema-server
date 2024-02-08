import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from 'src/modules/user/user.module';
import { DeviceModule } from 'src/modules/device/device.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { AppGateway } from './app.gateway';

@Module({
  imports: [UserModule, DeviceModule, forwardRef(() => NotificationModule)],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class GatewayModule {}
