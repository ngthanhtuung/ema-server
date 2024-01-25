import { Module } from '@nestjs/common';
import { EventTypesService } from './event_types.service';
import { EventTypesController } from './event_types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventTypeEntity } from './event_types.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventTypeEntity])],
  providers: [EventTypesService],
  controllers: [EventTypesController],
  exports: [EventTypesService],
})
export class EventTypesModule {}
