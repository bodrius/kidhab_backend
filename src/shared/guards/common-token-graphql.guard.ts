import { Injectable, ExecutionContext } from '@nestjs/common';
import { TokenGuard } from './token.guard';
import { UserTypes } from './user-types.enum';
import { SessionEntity } from '@src/modules/sessions/session.entity';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GqlContext } from '@src/graphql/graphql-context.interface';

@Injectable()
export class CommonTokenGraphqlGuard extends TokenGuard {
  type = UserTypes.ABSTRACT;

  getToken(context: ExecutionContext): string {
    const ctx = GqlExecutionContext.create(context).getContext();
    return ctx.token;
  }

  checkUser(session: SessionEntity): void {
    return null;
  }

  setRequestUser(session: SessionEntity, context: ExecutionContext): void {
    const ctx: GqlContext = GqlExecutionContext.create(context).getContext();
    ctx.user = session.parent || session.child;
  }

  setRequestSession(session: SessionEntity, context: ExecutionContext): void {
    const ctx = GqlExecutionContext.create(context).getContext();
    ctx.session = session;
  }
}
