import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { PayloadAccount } from 'src/modules/account/dto/account.response';

type BodyUser = Request & { user: PayloadAccount };
export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): PayloadAccount => {
    const reqBody: BodyUser = ctx.switchToHttp().getRequest<BodyUser>();
    return reqBody.user;
  },
);
