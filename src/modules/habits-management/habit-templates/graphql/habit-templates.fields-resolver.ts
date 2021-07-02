import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { GqlContext } from '@src/graphql/graphql-context.interface';
import { Languages } from '@src/shared/interfaces/languages.enum';
import { HabitTemplateModel } from './habit-template.model';
import { HabitTemplateEntity } from '../common/habit-template.entity';
import { TranslationsResolverBase } from '@src/shared/helpers/translations-resolver.base';

@Resolver(of => HabitTemplateModel)
export class HabitTemplatesFieldsResolver extends TranslationsResolverBase {
  @ResolveField()
  name(
    @Context() ctx: GqlContext,
    @Parent() habitTemplate: HabitTemplateEntity,
  ): string {
    const language = this.getLanguage(ctx);
    return (
      habitTemplate.name ||
      habitTemplate.translations.name[language] ||
      habitTemplate.translations.name[Languages.RU]
    );
  }
}
