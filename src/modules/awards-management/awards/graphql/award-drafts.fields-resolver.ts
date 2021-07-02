import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { GqlContext } from '@src/graphql/graphql-context.interface';
import { TranslationsResolverBase } from '@src/shared/helpers/translations-resolver.base';
import { AwardDraft } from '../common/award.entity';
import { AwardDraftModel } from './award-draft.model';

@Resolver(of => AwardDraftModel)
export class AwardDraftsFieldsResolver extends TranslationsResolverBase {
  @ResolveField()
  name(@Context() ctx: GqlContext, @Parent() draft: AwardDraft): string {
    if (!draft?.name && !draft?.translations) {
      return null;
    }

    const language = this.getLanguage(ctx);
    return this.getNameTranslation(draft, language);
  }
}
