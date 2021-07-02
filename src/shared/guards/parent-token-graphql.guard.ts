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
export class ParentTokenGraphqlGuard extends TokenGuard {
  type = UserTypes.PARENT;

  getToken(context: ExecutionContext): string {
    const ctx = GqlExecutionContext.create(context).getContext();
    return ctx.token;
  }

  checkUser(session: SessionEntity): void {
    if (!session.parent && this.type === UserTypes.PARENT) {
      throw new UnauthorizedException('This route only accessible for parents');
    }
  }

  setRequestUser(session: SessionEntity, context: ExecutionContext): void {
    const ctx: GqlContext = GqlExecutionContext.create(context).getContext();
    ctx.parent = session.parent;
  }

  setRequestSession(session: SessionEntity, context: ExecutionContext): void {
    const ctx: GqlContext = GqlExecutionContext.create(context).getContext();
    ctx.session = session;
  }
}
