import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './notification.entity';
import { UserModule } from '../user/user.module';
import { FirebaseProviderModule } from 'src/providers/firebase/provider.module';
import { DeviceModule } from '../device/device.module';
import { UserNotificationsModule } from '../user_notifications/user_notifications.module';
import { GatewayModule } from 'src/sockets/gateway.module';

@Module({
  imports: [
    forwardRef(() => GatewayModule),
    TypeOrmModule.forFeature([NotificationEntity]),
    UserModule,
    FirebaseProviderModule,
    DeviceModule,
    UserNotificationsModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
