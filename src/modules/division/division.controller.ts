import { DivisionService } from './division.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Param, Get, Put, Controller, Post, Query } from '@nestjs/common';
import {
  DivisionCreateRequest,
  DivisionUpdateRequest,
} from './dto/division.request';
import { Roles } from 'src/decorators/role.decorator';
import { ERole } from 'src/common/enum/enum';
import { DivisionPagination } from './dto/division.pagination';
import { IPaginateResponse } from '../base/filter.pagination';
import { DivisionResponse } from './dto/division.response';
import { Public } from 'src/decorators/public.decorator';

@Controller('division')
@ApiBearerAuth()
@ApiTags('Division')
export class DivisionController {
  constructor(private readonly divisionService: DivisionService) {}

  @Get()
  @Roles(ERole.MANAGER, ERole.STAFF)
  async getAllDivision(
    @Query() divisionPagination: DivisionPagination,
    @Query('mode') mode: number,
  ): Promise<IPaginateResponse<DivisionResponse>> {
    return await this.divisionService.getAllDivision(
      divisionPagination,
      Number(mode),
    );
  }

  /**
   *  Get getDivisionById
   * @param data
   */

  @Get('/:divisionId')
  @Roles(ERole.MANAGER)
  async getDivisionById(
    @Param('divisionId') id: string,
  ): Promise<DivisionResponse> {
    return await this.divisionService.getDivisionById(id);
  }

  /**
   *  Create division
   * @param data
   */

  @Post()
  @Public()
  async createDivision(
    @Body() data: DivisionCreateRequest,
  ): Promise<string | undefined> {
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
    @Body() data: DivisionUpdateRequest,
  ): Promise<string | undefined> {
    return await this.divisionService.updateDivision(id, data);
  }

  @Put('/:divisionId/status')
  async updateStatus(
    @Param('divisionId') id: string,
  ): Promise<string | undefined> {
    return await this.divisionService.updateStatus(id);
  }
}
