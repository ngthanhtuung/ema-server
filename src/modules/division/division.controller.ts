
import { DivisionService } from './division.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Param, Get, Put, Controller, Post } from '@nestjs/common';
import { DivisionCreateRequest, DivisionUpdateRequest } from './dto/division.request';
import { Roles } from 'src/decorators/role.decorator';
import { ERole } from 'src/common/enum/enum';

@Controller('division')
@ApiBearerAuth()
@ApiTags('division-controller')

export class DivisionController {
  constructor(
    private readonly divisionService: DivisionService,
  ) { }

  /**
   *  Get all division
   */

  @Get('/:divisionId')
  @Roles(ERole.MANAGER)
  async getDivisionById(@Param('divisionId') id: string): Promise<any | undefined> {
    return await this.divisionService.getDivisionById(id);
  }

  /**
   *  Create division
   * @param data
   */

  @Post()

  async createDivision(data: DivisionCreateRequest): Promise<string | undefined> {
    return await this.divisionService.createDivision(data);
  }

  /**
   *  Update division
   * @param id
   * @body data
   */
  @Put('/:divisionId')
  @Roles(ERole.MANAGER)
  async updateDivision(
    @Param('divisionId') id: string,
    @Body() data: DivisionUpdateRequest
  ): Promise<string | undefined> {
    return await this.divisionService.updateDivision(id, data);
  }
}

