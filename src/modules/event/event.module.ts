import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './event.entity';
import { AssignEventModule } from '../assign-event/assign-event.module';
import { FileModule } from 'src/file/file.module';
import { TaskModule } from '../task/task.module';
import { ContractsModule } from '../contracts/contracts.module';
import { CustomerContactsModule } from '../customer_contacts/customer_contacts.module';
import { BudgetsModule } from '../budgets/budgets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity]),
    AssignEventModule,
    FileModule,
    TaskModule,
    ContractsModule,
    CustomerContactsModule,
    BudgetsModule,
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
