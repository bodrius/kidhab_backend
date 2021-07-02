import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { ParentModel } from '@src/modules/parents/graphql/parent.model';
import { ParentsAuthService } from '../common/parents-auth.service';
import { ParentsSignUpDto } from '../common/dto/parents-sign-up.dto';
import { ParentWithToken } from './parent-with-token.model';
import { ParentsSignInDto } from '../common/dto/parents-sign-in.dto';
import { GqlContext } from '@src/graphql/graphql-context.interface';
import { SuccessModel } from '@src/graphql/success.model';
import { UseGuards } from '@nestjs/common';
import { ParentTokenGraphqlGuard } from '@src/shared/guards/parent-token-graphql.guard';
import { SessionEntity } from '@src/modules/sessions/session.entity';
import { Connection } from 'typeorm';
import { Languages } from '@src/shared/interfaces/languages.enum';

@Resolver(of => ParentModel)
export class ParentsAuthResolver {
  constructor(
    private parentsAuthService: ParentsAuthService,
    private connection: Connection,
  ) {}

  @Mutation(returns => ParentWithToken, {
    description:
      'Sign-Up parent mutation.' +
      ' Throws 409 if parent with such email exists',
  })
  async parentSignUp(
    @Context() ctx: GqlContext,
    @Args() parentsSignUpDto: ParentsSignUpDto,
  ): Promise<any> {
    const parentWithToken = await this.parentsAuthService.signUp(
      parentsSignUpDto,
    );
    ctx.token = parentWithToken.token;

    return parentWithToken;
  }

  @Mutation(returns => ParentWithToken, {
    description:
      'Sign-In parent mutation.' +
      ' Throws 404 if parent with such email does not exist.' +
      ' Throws 401 if provided password is wrong',
  })
  async parentSignIn(
    @Context() ctx: GqlContext,
    @Args() parentsSignInDto: ParentsSignInDto,
  ): Promise<any> {
    const parentWithToken = await this.parentsAuthService.signIn(
      parentsSignInDto,
    );
    ctx.token = parentWithToken.token;

    return parentWithToken;
  }

  @Mutation(returns => ParentWithToken)
  async parentSignInApple(
    @Context() ctx: GqlContext,
    @Args('identityToken') identityToken: string,
    @Args('language', { defaultValue: Languages.EN }) language: Languages,
  ): Promise<any> {
    const parentWithToken = await this.parentsAuthService.signInApple(
      identityToken,
      language,
    );
    ctx.token = parentWithToken.token;

    return parentWithToken;
  }

  @UseGuards(ParentTokenGraphqlGuard)
  @Mutation(returns => SuccessModel, {
    description:
      'Add device token for parent.' +
      ' Could be chained with sign-in/sign-up.' +
      ' Throws 401 if bearer auth failed.' +
      ' Throws 409 if session with such device token already exists',
  })
  async setParentDeviceToken(
    @Context('session') session: SessionEntity,
    @Args('deviceToken') deviceToken: string,
  ): Promise<SuccessModel> {
    await this.parentsAuthService.setParentDeviceToken(session, deviceToken);
    return { success: true };
  }

  @UseGuards(ParentTokenGraphqlGuard)
  @Mutation(returns => SuccessModel, {
    description: 'Log out parent. Throws 401 if bearer auth failed',
  })
  async logOutParent(
    @Context('session') session: SessionEntity,
  ): Promise<SuccessModel> {
    await this.parentsAuthService.logOutParent(session);
    return { success: true };
  }
}
