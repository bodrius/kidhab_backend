import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { HabitTemplatesService } from '../common/habit-templates.service';
import { HabitCategoryModel } from '../../habit-categories/graphql/habit-category.model';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { HabitCategoryEntity } from '../../habit-categories/common/habit-category.entity';
import { HabitTemplateEntity } from '../common/habit-template.entity';

@Resolver(of => HabitCategoryModel)
export class HabitCategoriesTemplatesResolver {
  constructor(private habitTemplatesService: HabitTemplatesService) {}

  @ResolveField()
  async templates(
    @Parent() category: HabitCategoryEntity,
    @Context('user') user: ChildEntity | ParentEntity,
  ): Promise<HabitTemplateEntity[]> {
    return (
      category.templates ||
      (await this.habitTemplatesService.getHabitTemplatesByCategoryAndFamily(
        category.id,
        user.familyId,
      ))
    );
  }
}
