import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { HabitTemplatesService } from '../common/habit-templates.service';
import { FamilyModel } from '@src/modules/families/graphql/family.model';
import { FamilyEntity } from '@src/modules/families/common/family.entity';
import { HabitTemplateEntity } from '../common/habit-template.entity';

@Resolver(of => FamilyModel)
export class FamiliesHabitTemplatesResolver {
  constructor(private habitTemplatesService: HabitTemplatesService) {}

  @ResolveField()
  async habitTemplates(
    @Parent() family: FamilyEntity,
  ): Promise<HabitTemplateEntity[]> {
    return (
      family.habitTemplates ||
      (await this.habitTemplatesService.getHabitTemplatesByFamily(family.id))
    );
  }
}
