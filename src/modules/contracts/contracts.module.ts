import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';

@Module({
  providers: [ContractsService],
})
export class ContractsModule {}
