import { Controller, Get, Post, Query } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/decorators/getUser.decorator';
import { TimesheetEntity } from './timesheet.entity';

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

  @Get('')
  @ApiQuery({
    name: 'eventId',
    required: false,
  })
  @ApiQuery({
    name: 'date',
    required: false,
  })
  async checkEventTimekeeping(
    @Query('eventId') eventId: string,
    @GetUser() user: string,
    @Query('date') date: string,
  ): Promise<TimesheetEntity> {
    return await this.timesheetService.checkTimekeepingInEvent(
      eventId,
      JSON.parse(user).id,
      date,
    );
  }
}
