import { Controller } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';

@Controller('timesheet')
export class TimesheetController {
  constructor(private readonly timesheetService: TimesheetService) {}
}
