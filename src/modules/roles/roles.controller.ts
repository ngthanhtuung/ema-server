import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { RoleEntity } from './roles.entity';
import { Roles } from 'src/decorators/role.decorator';
import { ERole } from 'src/common/enum/enum';

@Controller('roles')
@ApiTags('Roles')
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly roleService: RolesService) {}

  @Get()
  @Roles(ERole.ADMIN)
  async getAllRoles(): Promise<RoleEntity[] | undefined> {
    return await this.roleService.findAll();
  }
}
