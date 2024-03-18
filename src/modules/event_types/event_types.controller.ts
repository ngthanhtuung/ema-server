import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventTypesService } from './event_types.service';
import { EventTypeEntity } from './event_types.entity';
import { Public } from 'src/decorators/public.decorator';

@Controller('event-types')
@ApiTags('Event Type')
export class EventTypesController {
  constructor(private readonly eventTypesService: EventTypesService) {}

  @Get()
  @Public()
  async getAllEventTypes(): Promise<EventTypeEntity[] | undefined> {
    return await this.eventTypesService.findAll();
  }
}
