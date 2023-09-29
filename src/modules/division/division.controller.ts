import { Controller } from '@nestjs/common';
import { DivisionService } from './division.service';

@Controller('division')
export class DivisionController {
  constructor(private readonly divisionService: DivisionService) {}
}
