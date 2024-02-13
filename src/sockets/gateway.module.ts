import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from 'src/modules/user/user.module';
import { DeviceModule } from 'src/modules/device/device.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { AppGateway } from './app.gateway';
import { GatewaySessionManager } from './gateway.session';
import { Services } from 'src/utils/constants';
import { GroupsModule } from 'src/modules/groups/groups.module';
import { ConversationsModule } from 'src/modules/conversations/conversations.module';

@Module({
  imports: [
    UserModule,
    DeviceModule,
    forwardRef(() => NotificationModule),
    GroupsModule,
    ConversationsModule,
  ],
  providers: [
    AppGateway,
    {
      provide: Services.GATEWAY_SESSION_MANAGER,
      useClass: GatewaySessionManager,
    },
  ],
  exports: [
    AppGateway,
    {
      provide: Services.GATEWAY_SESSION_MANAGER,
      useClass: GatewaySessionManager,
    },
  ],
})
export class GatewayModule {}
