import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { forwardRef } from '@nestjs/common/utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity';
// import { EventModule } from '../event/event.module';
import { TaskfileModule } from '../taskfile/taskfile.module';
import { AssignTaskModule } from '../assign-task/assign-task.module';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { GatewayModule } from 'src/sockets/gateway.module';
import { DeviceModule } from '../device/device.module';

@Module({
  imports: [
    GatewayModule,
    TypeOrmModule.forFeature([TaskEntity]),
    forwardRef(() => TaskfileModule),
    AssignTaskModule,
    NotificationModule,
    UserModule,
    DeviceModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
