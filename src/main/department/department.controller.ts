import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import DepartmentCreateDto from './dto/department-create.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import DepartmentPagination from './dto/department.pagination';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/role-auth/role.guard';
import { hasRoles } from '../auth/role-auth/roles.decorator';
import { RoleEnum } from '../role/enum/role.enum';
import DepartmentUpdateDto from './dto/department-update.dto';
import { GetUser } from 'src/decorators/getUser.decorator';
import User from '../user/user.entity';

@Controller('department')
@ApiTags('department-controller')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) { }

  @Get()
  async getAllDepartment(@Query() departmentPagination: DepartmentPagination): Promise<any | undefined> {
    return await this.departmentService.getAllDepartment(departmentPagination);
  }

  @Post()
  @hasRoles(RoleEnum.ADMIN)
  async createDepartment(@Body() department: DepartmentCreateDto): Promise<any | undefined> {
    return await this.departmentService.createDepartment(department);
  }

  @Put(':idDepartment')
  @hasRoles(RoleEnum.ADMIN)
  async updateDepartment(@Param('idDepartment') idDepartment: string, @Body() department: DepartmentUpdateDto, @GetUser() user: User): Promise<any | undefined> {
    return await this.departmentService.updateDepartment(idDepartment, department, user);
  }

  @Put('/:idDepartment/change-status')
  @hasRoles(RoleEnum.ADMIN)
  async changeStatus(@Param('idDepartment') idDepartment: string, @GetUser() user: User): Promise<any | undefined> {
    return await this.departmentService.changeStatusDepartment(idDepartment, user);
  }

}
