import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { GqlContext } from '@src/graphql/graphql-context.interface';
import { Languages } from '@src/shared/interfaces/languages.enum';
import { TranslationsDto } from '../dto/translations.dto';

interface EntityWithNameTranslations {
  name?: string;
  translations?: TranslationsDto;
}

export abstract class TranslationsResolverBase {
  protected getLanguage(ctx: GqlContext): Languages {
    let user: ParentEntity | ChildEntity = ctx.user;
    if (!user) {
      user = ctx.parent || ctx.child;
    }

    return user.language;
  }

  protected getNameTranslation(
    entity: EntityWithNameTranslations,
    language: Languages,
  ): string {
    const { name, translations } = entity;

    if (name) {
      return name;
    }
    if (translations.name) {
      return (
        entity.translations?.name[language] ||
        entity.translations?.name[Languages.RU]
      );
    }

    return null;
  }
}
