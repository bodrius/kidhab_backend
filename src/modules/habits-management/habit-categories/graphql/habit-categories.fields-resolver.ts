import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { GqlContext } from '@src/graphql/graphql-context.interface';
import { Languages } from '@src/shared/interfaces/languages.enum';
import {
  HabitCategoryModel,
  HabitCategoryWithoutTemplatesModel,
} from './habit-category.model';
import { HabitCategoryEntity } from '../common/habit-category.entity';
import { TranslationsResolverBase } from '@src/shared/helpers/translations-resolver.base';

@Resolver(of => HabitCategoryModel)
export class HabitCategoriesFieldsResolver extends TranslationsResolverBase {
  @ResolveField()
  name(
    @Context() ctx: GqlContext,
    @Parent() habitCategory: HabitCategoryEntity,
  ): string {
    const language = this.getLanguage(ctx);
    return (
      habitCategory.name ||
      habitCategory.translations.name[language] ||
      habitCategory.translations.name[Languages.RU]
    );
  }
}

@Resolver(of => HabitCategoryWithoutTemplatesModel)
export class HabitCategoryWithoutTemplatesFieldsResolver extends HabitCategoriesFieldsResolver {}
