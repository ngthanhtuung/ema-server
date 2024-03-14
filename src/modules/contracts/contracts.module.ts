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

@Module({
  imports: [
    TypeOrmModule.forFeature([ContractEntity]),
    SharedModule,
    UserModule,
    FileModule,
    forwardRef(() => ItemsModule),
  ],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [ContractsService],
})
export class ContractsModule {}
