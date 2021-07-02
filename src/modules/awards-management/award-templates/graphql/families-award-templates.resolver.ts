import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { FamilyModel } from '@src/modules/families/graphql/family.model';
import { AwardTemplatesService } from '../common/award-templates.service';

@Resolver(of => FamilyModel)
export class FamiliesAwardTemplatesResolver {
  constructor(private awardTemplatesService: AwardTemplatesService) {}

  @ResolveField()
  async awardTemplates(@Parent() family: FamilyModel): Promise<any[]> {
    return (
      family.awardTemplates ||
      (await this.awardTemplatesService.getAwardTemplatesForFamily(family.id))
    );
  }
}
