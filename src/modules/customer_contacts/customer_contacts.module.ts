import { Module } from '@nestjs/common';
import { CustomerContactsService } from './customer_contacts.service';
import { CustomerContactsController } from './customer_contacts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerContactEntity } from './customer_contacts.entity';
import { UserModule } from '../user/user.module';
import { EventTypesModule } from '../event_types/event_types.module';
import { ContractsModule } from '../contracts/contracts.module';
import { forwardRef } from '@nestjs/common/utils';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerContactEntity]),
    UserModule,
    EventTypesModule,
    forwardRef(() => ContractsModule),
  ],
  providers: [CustomerContactsService],
  controllers: [CustomerContactsController],
  exports: [CustomerContactsService],
})
export class CustomerContactsModule {}
