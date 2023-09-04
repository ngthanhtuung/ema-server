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

  /**
   * http://localhost:6969/api/v1/department/list(Get)
   * getAllDepartment
   * @param departmentPagination 
   * @returns 
   */
  @Get('/list')
  async getAllDepartment(@Query() departmentPagination: DepartmentPagination): Promise<any | undefined> {
    return await this.departmentService.getAllDepartment(departmentPagination);
  }

  /**
   * http://localhost:6969/api/v1/department/create(Post)
   * createDepartment
   * @param department 
   * @returns 
   */
  @Post('/create')
  @hasRoles(RoleEnum.ADMIN)
  async createDepartment(@Body() department: DepartmentCreateDto): Promise<any | undefined> {
    return await this.departmentService.createDepartment(department);
  }

  /**
   * http://localhost:6969/api/v1/department/:idDepartment(Put)
   * updateDepartment
   * @param idDepartment 
   * @param department 
   * @param user 
   * @returns 
   */
  @Put(':idDepartment')
  @hasRoles(RoleEnum.ADMIN)
  async updateDepartment(@Param('idDepartment') idDepartment: string, @Body() department: DepartmentUpdateDto, @GetUser() user: User): Promise<any | undefined> {
    return await this.departmentService.updateDepartment(idDepartment, department, user);
  }

  /**
   * http://localhost:6969/api/v1/department/:idDepartment/change-status(put)
   * changeStatus
   * @param idDepartment 
   * @param user 
   * @returns 
   */
  @Put('/:idDepartment/change-status')
  @hasRoles(RoleEnum.ADMIN)
  async changeStatus(@Param('idDepartment') idDepartment: string, @GetUser() user: User): Promise<any | undefined> {
    return await this.departmentService.changeStatusDepartment(idDepartment, user);
  }

}
