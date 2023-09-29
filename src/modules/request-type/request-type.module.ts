import { Module } from '@nestjs/common';
import { RequestTypeService } from './request-type.service';
import { RequestTypeController } from './request-type.controller';

@Module({
  controllers: [RequestTypeController],
  providers: [RequestTypeService],
})
export class RequestTypeModule {}
