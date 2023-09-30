import { Controller, Post, UseGuards } from '@nestjs/common';
import { DivisionService } from './division.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import DivisionCreateRequest from './dto/division.request';

@Controller('division')
@ApiBearerAuth()
@ApiTags('division-controller')

export class DivisionController {
  constructor(
    private readonly divisionService: DivisionService,
  ) { }


  @Post()

  async createDivision(data: DivisionCreateRequest): Promise<string | undefined> {
    return await this.divisionService.createDivision(data);
  }

}


