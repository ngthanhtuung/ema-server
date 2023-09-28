import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ERole } from 'src/common/enum/enum';
import { ROLES_KEY } from 'src/decorators/role.decorator';
import { PayloadAccount } from 'src/modules/account/dto/account.response';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('zo');

    const requiredRoles = this.reflector.getAllAndOverride<ERole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const req = context.switchToHttp().getRequest();
    const user: PayloadAccount = JSON.parse(req.user) as PayloadAccount;

    return requiredRoles.some((role) => user.role === role);
  }
}
