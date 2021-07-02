import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { ChildEntity } from '../../../children/common/child.entity';
import { ChildModel } from '@src/modules/children/graphql/child.model';
import { AwardsService } from '../common/awards.service';

@Resolver(of => ChildModel)
export class ChildrenAwardsResolver {
  constructor(private awardsService: AwardsService) {}

  @ResolveField()
  async awards(@Parent() child: ChildEntity): Promise<any> {
    return child.awards || (await this.awardsService.getChildAwards(child.id));
  }
}
