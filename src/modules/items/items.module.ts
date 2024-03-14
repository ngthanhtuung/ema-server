import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemEntity } from './items.entity';
import { CategoriesModule } from '../categories/categories.module';
import { BudgetsModule } from '../budgets/budgets.module';
import { EventModule } from '../event/event.module';
import { forwardRef } from '@nestjs/common/utils';
import { ContractsModule } from '../contracts/contracts.module';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItemEntity]),
    CategoriesModule,
    BudgetsModule,
    SharedModule,
    UserModule,
  ],
  providers: [ItemsService],
  controllers: [ItemsController],
  exports: [ItemsService],
})
export class ItemsModule {}
