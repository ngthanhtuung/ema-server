import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { BudgetEntity } from './budget.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { GatewayModule } from 'src/sockets/gateway.module';
import { DeviceModule } from '../device/device.module';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([BudgetEntity]),
    GatewayModule,
    DeviceModule,
    NotificationModule,
  ],
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}
