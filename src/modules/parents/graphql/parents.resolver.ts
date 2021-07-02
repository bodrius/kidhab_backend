import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { ParentModel } from '@src/modules/parents/graphql/parent.model';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { UseGuards } from '@nestjs/common';
import { ParentTokenGraphqlGuard } from '@src/shared/guards/parent-token-graphql.guard';
import { ParentsService } from '../common/parents.service';
import { UpdateLoggedParentDto } from './dto/update-logged-parent.dto';

@Resolver(of => ParentModel)
export class ParentsResolver {
  constructor(private parentsService: ParentsService) {}

  @UseGuards(ParentTokenGraphqlGuard)
  @Mutation(returns => ParentModel, { description: 'Updates logged in parent' })
  async updateLoggedParent(
    @Context('parent') parent: ParentEntity,
    @Args() updateLoggedParentDto: UpdateLoggedParentDto,
  ): Promise<any> {
    return this.parentsService.update(parent, updateLoggedParentDto);
  }
}
