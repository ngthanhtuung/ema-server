import { Controller } from '@nestjs/common';
import { RequestTypeService } from './request-type.service';

@Controller('request-type')
export class RequestTypeController {
  constructor(private readonly requestTypeService: RequestTypeService) {}
}
