import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { ParentModel } from '@src/modules/parents/graphql/parent.model';
import { FamiliesService } from '../common/families.service';

@Resolver(of => ParentModel)
export class ParentsFamilyResolver {
  constructor(private familiesService: FamiliesService) {}

  @ResolveField()
  async family(
    @Parent() parent: ParentModel,
  ): Promise<any> {
    return (
      parent.family || (await this.familiesService.getById(parent.familyId))
    );
  }
}
