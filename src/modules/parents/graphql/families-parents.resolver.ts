import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { FamilyModel } from '@src/modules/families/graphql/family.model';
import { ParentsService } from '../common/parents.service';

@Resolver(of => FamilyModel)
export class FamiliesParentsResolver {
  constructor(private parentsService: ParentsService) {}

  @ResolveField()
  async parents(@Parent() family: FamilyModel): Promise<any> {
    return (
      family.parents || (await this.parentsService.findByFamilyId(family.id))
    );
  }
}
