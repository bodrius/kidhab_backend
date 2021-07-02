import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { FamilyEntity } from '@src/modules/families/common/family.entity';
import { FamilyModel } from '@src/modules/families/graphql/family.model';
import { ChildEntity } from '../common/child.entity';
import { ChildrenService } from '../common/children.service';

@Resolver(of => FamilyModel)
export class FamiliesChildrenResolver {
  constructor(private childrenService: ChildrenService) {}

  @ResolveField()
  async children(@Parent() family: FamilyEntity): Promise<ChildEntity[]> {
    return (
      family.children ||
      (await this.childrenService.getChildrenByFamilyId(family.id))
    );
  }
}
