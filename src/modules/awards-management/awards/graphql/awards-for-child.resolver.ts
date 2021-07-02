import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { AwardModel } from './award.model';
import { AwardsService } from '../common/awards.service';
import { SuccessModel } from '@src/graphql/success.model';
import { ChildTokenGraphqlGuard } from '@src/shared/guards/child-token-graphql.guard';
import { CreateAwardRequestDto } from '../common/dto/create-award-request.dto';
import { UpdateAwardGqlDto } from '../common/dto/update-award.dto';

@Resolver(of => AwardModel)
@UseGuards(ChildTokenGraphqlGuard)
export class AwardsForChildResolver {
  constructor(private awardsService: AwardsService) {}

  @Mutation(returns => AwardModel, {
    description:
      'Create Award from draft.' +
      ' Throws 401 if bearer auth failed for child.',
  })
  async createAwardFromDraft(
    @Args() createAwardDto: CreateAwardRequestDto,
    @Context('child') child: ChildEntity,
  ): Promise<any> {
    return this.awardsService.createAwardDraft(child, createAwardDto);
  }

  @Mutation(returns => AwardModel, {
    description:
      'Update Award draft.' +
      ' Throws 401 if bearer auth failed for child.' +
      ' Throws 404 if award not found.' +
      ' Throws 403 if child trying to update not hist award',
  })
  async updateAwardDraft(
    @Args('awardId') awardId: string,
    @Args('updateAwardParams') updateAwardDto: UpdateAwardGqlDto,
    @Context('child') child: ChildEntity,
  ): Promise<any> {
    return this.awardsService.updateAwardDraft(awardId, updateAwardDto, child);
  }

  @Mutation(returns => SuccessModel, {
    description:
      'Delete logged child Award.' + ' Throws 404 if award not found.',
  })
  async deleteLoggedChildAward(
    @Args('awardId', ParseUUIDPipe) awardId: string,
    @Context('child') child: ChildEntity,
  ): Promise<SuccessModel> {
    await this.awardsService.deleteAwardByChild(awardId, child);
    return { success: true };
  }

  @Mutation(returns => AwardModel, {
    description:
      'Purchase award.' +
      ' Throws 404 if award not found.' +
      ' Throws 403 if child does not have enough points for award purchase',
  })
  async purchaseAward(
    @Args('awardId', ParseUUIDPipe) awardId: string,
    @Context('child') child: ChildEntity,
  ): Promise<any> {
    return this.awardsService.purchaseAward(awardId, child);
  }
}
