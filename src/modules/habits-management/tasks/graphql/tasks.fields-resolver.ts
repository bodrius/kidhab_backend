import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { TaskModel } from './task.model';
import { TaskEntity } from '../common/task.entity';
import { TranslationsResolverBase } from '@src/shared/helpers/translations-resolver.base';
import { GqlContext } from '@src/graphql/graphql-context.interface';
import { HabitEntity } from '../../habits/common/habit.entity';

@Resolver(of => TaskModel)
export class TasksFieldsResolver extends TranslationsResolverBase {
  @ResolveField()
  name(@Context() ctx: GqlContext, @Parent() task: TaskEntity): string {
    return task.name || this.getHabitName(ctx, task.habit);
  }

  @ResolveField()
  description(@Parent() task: TaskEntity): string {
    return task.description || task.habit.description;
  }

  @ResolveField()
  points(@Parent() task: TaskEntity): number {
    return task.totalPoints || task.habit.pointsRate;
  }

  @ResolveField()
  imageUrl(@Parent() task: TaskEntity): string {
    return task.imageUrl || task.habit.imageUrl;
  }

  private getHabitName(ctx: GqlContext, habit: HabitEntity) {
    const language = this.getLanguage(ctx);
    return this.getNameTranslation(habit, language);
  }
}
