import { Module } from '@nestjs/common';
import { AnnualLeaveService } from './annual-leave.service';
import { AnnualLeaveController } from './annual-leave.controller';

@Module({
  controllers: [AnnualLeaveController],
  providers: [AnnualLeaveService],
})
export class AnnualLeaveModule {}
