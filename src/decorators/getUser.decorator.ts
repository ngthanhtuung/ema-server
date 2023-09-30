import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { PayloadUser } from 'src/modules/user/dto/user.response';

type BodyUser = Request & { user: PayloadUser };
export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): PayloadUser => {
    const reqBody: BodyUser = ctx.switchToHttp().getRequest<BodyUser>();
    return reqBody.user;
  },
);
