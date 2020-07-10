import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    // HTTP request has a property call "user"
    // In this case, it's the object return after jwt validate the token
    return req.user;
  },
);
