import { Controller } from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('role')
@ApiTags('role-controller')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }
}
