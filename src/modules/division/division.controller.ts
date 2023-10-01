import { DivisionService } from './division.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Param, Get, Put, Controller, Post, Query } from '@nestjs/common';
import { DivisionCreateRequest, DivisionUpdateRequest } from './dto/division.request';
import { Roles } from 'src/decorators/role.decorator';
import { ERole } from 'src/common/enum/enum';
import { DivisionPagination } from './dto/division.pagination';

@Controller('division')
@ApiBearerAuth()
@ApiTags('division-controller')

export class DivisionController {
  constructor(
    private readonly divisionService: DivisionService,
  ) { }

  @Get()
  @Roles(ERole.MANAGER, ERole.STAFF)
  async getAllDivision(
    @Query() divisionPagination: DivisionPagination
  ): Promise<any | { message: string }> {
    return await this.divisionService.getAllDivision(divisionPagination);
  }

  /**
   *  Get all division
   * @param data
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

  @Put('/:divisionId/status')
  async updateStatus(@Param('divisionId') id: string): Promise<string | undefined> {
    return await this.divisionService.updateStatus(id);
  }
}

