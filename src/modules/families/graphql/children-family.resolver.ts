import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { FamiliesService } from '../common/families.service';
import { ChildModel } from '@src/modules/children/graphql/child.model';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { FamilyEntity } from '../common/family.entity';

@Resolver(of => ChildModel)
export class ChildrenFamilyResolver {
  constructor(private familiesService: FamiliesService) {}

  @ResolveField()
  async family(@Parent() child: ChildEntity): Promise<FamilyEntity> {
    return child.family || (await this.familiesService.getById(child.familyId));
  }
}
