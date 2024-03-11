import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetEntity } from './budgets.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BudgetEntity])],
  providers: [BudgetsService],
  controllers: [BudgetsController],
})
export class BudgetsModule {}
