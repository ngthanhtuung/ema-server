import { Controller } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('timesheet')
@ApiBearerAuth()
@ApiTags('Timesheet')
export class TimesheetController {
  constructor(private readonly timesheetService: TimesheetService) {}
}
