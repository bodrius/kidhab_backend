import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { TokenGuard } from './token.guard';
import { UserTypes } from './user-types.enum';
import { SessionEntity } from '@src/modules/sessions/session.entity';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GqlContext } from '@src/graphql/graphql-context.interface';

@Injectable()
export class ChildTokenGraphqlGuard extends TokenGuard {
  type = UserTypes.CHILD;

  getToken(context: ExecutionContext): string {
    const ctx = GqlExecutionContext.create(context).getContext();
    return ctx.token;
  }

  checkUser(session: SessionEntity): void {
    if (!session.child && this.type === UserTypes.CHILD) {
      throw new UnauthorizedException(
        'This route only accessible for children',
      );
    }
  }

  setRequestUser(session: SessionEntity, context: ExecutionContext): void {
    const ctx: GqlContext = GqlExecutionContext.create(context).getContext();
    ctx.child = session.child;
  }

  setRequestSession(session: SessionEntity, context: ExecutionContext): void {
    const ctx: GqlContext = GqlExecutionContext.create(context).getContext();
    ctx.session = session;
  }
}
