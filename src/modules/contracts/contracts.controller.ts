import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('contracts')
@ApiBearerAuth()
@ApiTags('Contracts')
export class ContractsController {}
