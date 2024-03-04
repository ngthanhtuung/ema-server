import { DivisionService } from './division.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Param, Get, Put, Controller, Post, Query } from '@nestjs/common';
import {
  DivisionConditionFind,
  DivisionCreateRequest,
  DivisionEventFind,
  DivisionUpdateRequest,
  EmployeeFreeFind,
} from './dto/division.request';
import { Roles } from 'src/decorators/role.decorator';
import { ERole } from 'src/common/enum/enum';
import { DivisionPagination } from './dto/division.pagination';
import { DivisionResponse } from './dto/division.response';
import { Public } from 'src/decorators/public.decorator';

@Controller('division')
@ApiBearerAuth()
@ApiTags('Division')
export class DivisionController {
  constructor(private readonly divisionService: DivisionService) {}

  @Get()
  @Roles(ERole.MANAGER, ERole.STAFF, ERole.ADMIN)
  async getAllDivision(
    @Query() divisionPagination: DivisionPagination,
    @Query('mode') mode: number,
  ): Promise<unknown> {
    return await this.divisionService.getAllDivision(
      divisionPagination,
      Number(mode),
    );
  }

  /**
   *  Get getDivisionById
   * @param data
   */
  @Get('/list/user')
  @Roles(ERole.MANAGER, ERole.STAFF, ERole.ADMIN)
  async getListUserDivisionByIdOrEmail(
    @Query() condition: DivisionConditionFind,
  ): Promise<DivisionResponse> {
    return await this.divisionService.getListUserDivisionByIdOrEmail(condition);
  }

  /**
   *  Get getDivisionById
   * @param data
   */
  @Get('/list/assignee/employee')
  @Roles(ERole.MANAGER, ERole.STAFF, ERole.ADMIN)
  async getListAssigneeEmployee(
    @Query() condition: EmployeeFreeFind,
  ): Promise<DivisionResponse> {
    return await this.divisionService.getListAssigneeEmployee(condition);
  }

  /**
   *  Get getDivisionById
   * @param data
   */
  @Get('/list/assignee/division')
  @Roles(ERole.MANAGER, ERole.STAFF, ERole.ADMIN)
  async getListAssigneeDivision(
    @Query() condition: DivisionEventFind,
  ): Promise<DivisionResponse[]> {
    return await this.divisionService.getListAssigneeDivision(condition);
  }

  /**
   *  Get getDivisionById
   * @param data
   */

  @Get('/:divisionId')
  @Roles(ERole.MANAGER, ERole.STAFF, ERole.ADMIN)
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
  @Roles(ERole.MANAGER, ERole.ADMIN)
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
