import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { ChildModel } from '@src/modules/children/graphql/child.model';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { ChildrenAuthService } from '../common/children-auth.service';
import { ChildWithToken } from './child-with-token.model';
import { SetChildCredsDto } from '../common/dto/set-child-creds.dto';
import { ChildTokenGraphqlGuard } from '@src/shared/guards/child-token-graphql.guard';
import { UseGuards } from '@nestjs/common';
import { ChildrenSignInDto } from '../common/dto/children-sign-in.dto';
import { GqlContext } from '@src/graphql/graphql-context.interface';
import { SuccessModel } from '@src/graphql/success.model';
import { SessionEntity } from '@src/modules/sessions/session.entity';

@Resolver(of => ChildModel)
export class ChildrenAuthResolver {
  constructor(private childrenAuthService: ChildrenAuthService) {}

  @Query(returns => ChildModel, {
    description:
      'Returns currently logged child.' +
      ' Throws 401 if bearer auth failing for child',
  })
  @UseGuards(ChildTokenGraphqlGuard)
  async getLoggedChild(@Context('child') child: ChildEntity): Promise<any> {
    return this.childrenAuthService.getLoggedChild(child.id);
  }

  @Mutation(returns => ChildWithToken, {
    description:
      'Activate child profile by inviteHash from link.' +
      ' Throws 404 if child with such inviteHash not found',
  })
  async activateChild(
    @Context() ctx: GqlContext,
    @Args('inviteHash') inviteHash: string,
  ): Promise<any> {
    const childWithToken = await this.childrenAuthService.activateChild(
      inviteHash,
    );
    ctx.token = childWithToken.token;
    ctx.child = childWithToken.child;

    return childWithToken;
  }

  @Mutation(returns => ChildWithToken, {
    description:
      'Sign In child.' +
      ' Throws 404 if child with such email not found.' +
      ' Throws 401 if provided password is wrong',
  })
  async childSignIn(
    @Context() ctx: GqlContext,
    @Args() childrenSignInDto: ChildrenSignInDto,
  ): Promise<any> {
    const childWithToken = await this.childrenAuthService.signIn(
      childrenSignInDto,
    );
    ctx.token = childWithToken.token;

    return childWithToken;
  }

  @UseGuards(ChildTokenGraphqlGuard)
  @Mutation(returns => ChildModel, {
    description:
      'Set child creds.' +
      ' Throws 401 if bearer authorization failed for child.' +
      ' Throws 409 if child with such email already exists',
  })
  async setChildCreds(
    @Args() setChildCredsDto: SetChildCredsDto,
    @Context('child') child: ChildEntity,
  ): Promise<any> {
    const {
      child: updatedChild,
    } = await this.childrenAuthService.setChildCreds(child, setChildCredsDto);
    return updatedChild;
  }

  @UseGuards(ChildTokenGraphqlGuard)
  @Mutation(returns => SuccessModel, {
    description:
      'Add device token for child.' +
      ' Could be chained with sign-in/sign-up.' +
      ' Throws 401 if bearer auth failed.' +
      ' Throws 409 if session with such device token already exists',
  })
  async setChildDeviceToken(
    @Context('session') session: SessionEntity,
    @Args('deviceToken') deviceToken: string,
  ): Promise<SuccessModel> {
    await this.childrenAuthService.setChildDeviceToken(session, deviceToken);
    return { success: true };
  }

  @UseGuards(ChildTokenGraphqlGuard)
  @Mutation(returns => SuccessModel, {
    description: 'Log out child. Throws 401 if bearer auth failed',
  })
  async logOutChild(
    @Context('session') session: SessionEntity,
  ): Promise<SuccessModel> {
    await this.childrenAuthService.logOutChild(session);
    return { success: true };
  }
}
