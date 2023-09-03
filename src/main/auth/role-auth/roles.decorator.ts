import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { RoleEnum } from 'src/main/role/enum/role.enum';


export const ROLES_KEY = 'roles';
export const hasRoles = (...roles: RoleEnum[]): CustomDecorator =>
    SetMetadata(ROLES_KEY, roles);
