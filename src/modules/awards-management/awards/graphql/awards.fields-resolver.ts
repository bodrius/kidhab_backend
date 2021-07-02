import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { GqlContext } from '@src/graphql/graphql-context.interface';
import { TranslationsResolverBase } from '@src/shared/helpers/translations-resolver.base';
import { AwardModel } from './award.model';
import { AwardEntity } from '../common/award.entity';

@Resolver(of => AwardModel)
export class AwardsFieldsResolver extends TranslationsResolverBase {
  @ResolveField()
  name(@Context() ctx: GqlContext, @Parent() award: AwardEntity): string {
    const language = this.getLanguage(ctx);
    return this.getNameTranslation(award, language);
  }
}
