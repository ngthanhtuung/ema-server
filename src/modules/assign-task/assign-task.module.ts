import { Module } from '@nestjs/common';
import { AssignTaskController } from './assign-task.controller';
import { AssignTaskService } from './assign-task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignTaskEntity } from './assign-task.entity';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { GatewayModule } from 'src/sockets/gateway.module';
import { DeviceModule } from '../device/device.module';

@Module({
  imports: [
    GatewayModule,
    TypeOrmModule.forFeature([AssignTaskEntity]),
    NotificationModule,
    UserModule,
    DeviceModule,
  ],
  controllers: [AssignTaskController],
  providers: [AssignTaskService],
  exports: [AssignTaskService],
})
export class AssignTaskModule {}
