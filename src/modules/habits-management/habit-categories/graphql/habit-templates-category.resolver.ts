import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { HabitTemplateModel } from '../../habit-templates/graphql/habit-template.model';
import { HabitTemplateEntity } from '../../habit-templates/common/habit-template.entity';
import { HabitCategoriesService } from '../common/habit-categories.service';
import { HabitCategoryEntity } from '../common/habit-category.entity';

@Resolver(of => HabitTemplateModel)
export class HabitTemplatesCategoryResolver {
  constructor(private habitCategoriesService: HabitCategoriesService) {}

  @ResolveField()
  async category(
    @Parent() habitTemplate: HabitTemplateEntity,
  ): Promise<HabitCategoryEntity> {
    return (
      habitTemplate.category ||
      this.habitCategoriesService.getCategory({ id: habitTemplate.categoryId })
    );
  }
}
