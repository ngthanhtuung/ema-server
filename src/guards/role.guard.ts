import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ERole } from 'src/common/enum/enum';
import { ROLES_KEY } from 'src/decorators/role.decorator';
import { PayloadUser } from 'src/modules/user/dto/user.response';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ERole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const req = context.switchToHttp().getRequest();
    const user: PayloadUser = JSON.parse(req.user) as PayloadUser;

    return requiredRoles.some((role) => user.role === role);
  }
}
