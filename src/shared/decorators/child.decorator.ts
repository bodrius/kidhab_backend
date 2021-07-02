import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const DChild = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const child = request.child;

    return key ? child && child[key] : child;
  },
);
