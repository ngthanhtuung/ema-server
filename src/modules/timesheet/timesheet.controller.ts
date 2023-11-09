import { Controller, Post, Query } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/decorators/getUser.decorator';

@Controller('timesheet')
@ApiBearerAuth()
@ApiTags('Timesheet')
export class TimesheetController {
  constructor(private readonly timesheetService: TimesheetService) {}

  @Post('/check-in')
  async checkIn(
    @Query('eventId') eventId: string,
    @GetUser() user: string,
  ): Promise<string> {
    return await this.timesheetService.checkIn(eventId, JSON.parse(user).id);
  }
}
