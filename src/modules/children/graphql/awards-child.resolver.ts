import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { AwardModel } from '@src/modules/awards-management/awards/graphql/award.model';
import { ChildrenService } from '../common/children.service';

@Resolver(of => AwardModel)
export class AwardsChildResolver {
  constructor(private childrenService: ChildrenService) {}

  @ResolveField()
  async child(
    @Parent() award: AwardModel,
  ): Promise<any> {
    return (
      award.child ||
      (await this.childrenService.getChild({ id: award.childId }))
    );
  }
}
