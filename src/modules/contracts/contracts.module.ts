import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractEntity } from './contracts.entity';
import { SharedModule } from 'src/shared/shared.module';
import { UserModule } from '../user/user.module';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContractEntity]),
    SharedModule,
    UserModule,
    FileModule,
  ],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [ContractsService],
})
export class ContractsModule {}
