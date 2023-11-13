import { Module } from '@nestjs/common';
import { AssignTaskController } from './assign-task.controller';
import { AssignTaskService } from './assign-task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignTaskEntity } from './assign-task.entity';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { GatewayModule } from 'src/sockets/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssignTaskEntity]),
    NotificationModule,
    UserModule,
    GatewayModule,
  ],
  controllers: [AssignTaskController],
  providers: [AssignTaskService],
  exports: [AssignTaskService],
})
export class AssignTaskModule {}
