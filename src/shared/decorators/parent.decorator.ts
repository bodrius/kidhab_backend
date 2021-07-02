import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const DParent = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const parent = request.parent;

    return key ? parent && parent[key] : parent;
  },
);
