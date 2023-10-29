import { Module } from '@nestjs/common';
import { AnnualLeaveService } from './annual-leave.service';
import { AnnualLeaveController } from './annual-leave.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnualLeaveEntity } from './annual-leave.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnnualLeaveEntity])],
  controllers: [AnnualLeaveController],
  providers: [AnnualLeaveService],
  exports: [AnnualLeaveService],
})
export class AnnualLeaveModule {}
