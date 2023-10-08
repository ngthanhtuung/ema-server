import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignEventEntity } from './assign-event.entity';
import { AssignEventService } from './assign-event.service';

@Module({
  imports: [TypeOrmModule.forFeature([AssignEventEntity])],
  controllers: [],
  providers: [AssignEventService],
  exports: [AssignEventService],
})
export class AssignEventModule {}
