import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetEntity } from './budgets.entity';
import { TransactionEntity } from './transactions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BudgetEntity, TransactionEntity])],
  providers: [BudgetsService],
  controllers: [BudgetsController],
  exports: [BudgetsService],
})
export class BudgetsModule {}
