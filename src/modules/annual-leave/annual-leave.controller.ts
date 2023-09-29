import { Controller } from '@nestjs/common';
import { AnnualLeaveService } from './annual-leave.service';

@Controller('annual-leave')
export class AnnualLeaveController {
  constructor(private readonly annualLeaveService: AnnualLeaveService) {}
}
