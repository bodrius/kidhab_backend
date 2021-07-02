import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { AwardTemplateModel } from './award-template.model';
import { GqlContext } from '@src/graphql/graphql-context.interface';
import { AwardTemplateEntity } from '../common/award-template.entity';
import { TranslationsResolverBase } from '@src/shared/helpers/translations-resolver.base';

@Resolver(of => AwardTemplateModel)
export class AwardTemplatesFieldsResolver extends TranslationsResolverBase {
  @ResolveField()
  name(
    @Context() ctx: GqlContext,
    @Parent() awardTemplate: AwardTemplateEntity,
  ): string {
    const language = this.getLanguage(ctx);
    return this.getNameTranslation(awardTemplate, language);
  }
}
