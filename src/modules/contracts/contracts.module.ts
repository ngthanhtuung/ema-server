import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractEntity } from './contracts.entity';
import { SharedModule } from 'src/shared/shared.module';
import { UserModule } from '../user/user.module';
import { FileModule } from 'src/file/file.module';
import { forwardRef } from '@nestjs/common/utils';
import { ItemsModule } from '../items/items.module';
import { NotificationModule } from '../notification/notification.module';
import { CustomerContactsModule } from '../customer_contacts/customer_contacts.module';
import { ContractEvidenceEntity } from './contract_evidence.entity';
import { PaymentMilestoneEntity } from './payment_milestone.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContractEntity,
      ContractEvidenceEntity,
      PaymentMilestoneEntity,
    ]),
    SharedModule,
    UserModule,
    FileModule,
    NotificationModule,
    CustomerContactsModule,
    forwardRef(() => ItemsModule),
  ],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [ContractsService],
})
export class ContractsModule {}
