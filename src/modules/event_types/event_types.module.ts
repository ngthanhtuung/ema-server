import { Module } from '@nestjs/common';
import { EventTypesService } from './event_types.service';
import { EventTypesController } from './event_types.controller';

@Module({
  providers: [EventTypesService],
  controllers: [EventTypesController]
})
export class EventTypesModule {}
