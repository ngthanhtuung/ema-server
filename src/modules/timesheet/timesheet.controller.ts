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
    name: 'me',
    type: 'boolean',
    required: true,
  })
  @ApiQuery({
    name: 'eventId',
    required: true,
  })
  // @ApiQuery({
  //   name: 'date',
  //   required: false,
  // })
  @ApiQuery({
    name: 'startDate',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
  })
  async checkEventTimekeeping(
    @Query('eventId') eventId: string,
    @GetUser() user: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    // @Query('date') date: string,
    @Query('me') me: boolean,
  ): Promise<TimesheetEntity> {
    return await this.timesheetService.checkTimekeepingInEvent(
      eventId,
      JSON.parse(user).id,
      startDate,
      endDate,
      me,
    );
  }
}
