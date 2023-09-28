import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { ERole } from 'src/common/enum/enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ERole[]): CustomDecorator =>
  SetMetadata(ROLES_KEY, roles);
