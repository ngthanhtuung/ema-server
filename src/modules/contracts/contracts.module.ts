import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractEntity } from './contracts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContractEntity])],
  providers: [ContractsService],
  controllers: [ContractsController],
})
export class ContractsModule {}
