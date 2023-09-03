import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import DepartmentCreateDto from './dto/department-create.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import DepartmentPagination from './dto/department.pagination';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/role-auth/role.guard';
import { hasRoles } from '../auth/role-auth/roles.decorator';
import { RoleEnum } from '../role/enum/role.enum';

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
}
