import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestEntity } from './request.entity';
import { forwardRef } from '@nestjs/common/utils';
import { AnnualLeaveModule } from '../annual-leave/annual-leave.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestEntity]),
    forwardRef(() => AnnualLeaveModule),
  ],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService],
})
export class RequestModule {}
