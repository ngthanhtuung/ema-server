import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestEntity } from './request.entity';
import { forwardRef } from '@nestjs/common/utils';
import { AnnualLeaveModule } from '../annual-leave/annual-leave.module';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { GatewayModule } from 'src/sockets/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestEntity]),
    forwardRef(() => AnnualLeaveModule),
    NotificationModule,
    UserModule,
    GatewayModule,
  ],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService],
})
export class RequestModule {}
