import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { HabitModel } from './habit.model';
import { HabitEntity } from '../common/habit.entity';
import { GqlContext } from '@src/graphql/graphql-context.interface';
import { TranslationsResolverBase } from '@src/shared/helpers/translations-resolver.base';

@Resolver(of => HabitModel)
export class HabitsBaseResolver extends TranslationsResolverBase {
  @ResolveField()
  points(@Parent() habit: HabitEntity): number {
    return habit.pointsRate;
  }

  @ResolveField()
  name(@Context() ctx: GqlContext, @Parent() habit: HabitEntity): string {
    const language = this.getLanguage(ctx);
    return this.getNameTranslation(habit, language);
  }
}
