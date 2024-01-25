import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EventTypesService } from './event_types.service';
import { EventTypeEntity } from './event_types.entity';
import { Roles } from 'src/decorators/role.decorator';
import { ERole } from 'src/common/enum/enum';

@Controller('event-types')
@ApiTags('Event Type')
@ApiBearerAuth()
export class EventTypesController {
  constructor(private readonly eventTypesService: EventTypesService) {}

  @Get()
  @Roles(ERole.MANAGER, ERole.ADMIN)
  async getAllEventTypes(): Promise<EventTypeEntity[] | undefined> {
    return await this.eventTypesService.findAll();
  }
}
