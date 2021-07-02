import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { HabitDraft } from '../common/habit.entity';
import { GqlContext } from '@src/graphql/graphql-context.interface';
import { TranslationsResolverBase } from '@src/shared/helpers/translations-resolver.base';
import { HabitDraftModel } from './habit-draft.model';

@Resolver(of => HabitDraftModel)
export class HabitDraftsFieldsResolver extends TranslationsResolverBase {
  @ResolveField()
  name(@Context() ctx: GqlContext, @Parent() draft: HabitDraft): string {
    if (!draft.name && !draft?.translations) {
      return null;
    }

    const language = this.getLanguage(ctx);
    return this.getNameTranslation(draft, language);
  }
}
