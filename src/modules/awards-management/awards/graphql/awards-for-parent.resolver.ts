import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { ParentTokenGraphqlGuard } from '@src/shared/guards/parent-token-graphql.guard';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { AwardModel } from './award.model';
import { AwardsService } from '../common/awards.service';
import { CreateAwardsDto } from '../common/dto/create-awards.dto';
import { SuccessModel } from '@src/graphql/success.model';
import { UpdateAwardGqlDto } from '../common/dto/update-award.dto';
import { ReviewAwardDraftDto } from '../common/dto/review-award-draft.dto';

@Resolver(of => AwardModel)
@UseGuards(ParentTokenGraphqlGuard)
export class AwardsForParentResolver {
  constructor(private awardsService: AwardsService) {}

  @Mutation(returns => [AwardModel], {
    description:
      'Creates Awards for child.' +
      ' Could be called with childId or after createChild mutation.' +
      ' Throws 403 if child is not member of parents family',
  })
  async createAwards(
    @Args() createAwardsDto: CreateAwardsDto,
    @Context('parent') parent: ParentEntity,
    @Context('child') child: ChildEntity,
  ): Promise<any> {
    return this.awardsService.createAwardsGql(createAwardsDto, parent, child);
  }

  @Mutation(returns => AwardModel, {
    description:
      'Updates child Award.' +
      ' Throws 401 if bearer auth failed for parent.' +
      ' Throws 404 if award not found.' +
      ' Throws 403 if child does not belong to parent family.',
  })
  async updateAward(
    @Args('awardId', ParseUUIDPipe) awardId: string,
    @Args('updateAwardParams') updateAwardGqlDto: UpdateAwardGqlDto,
    @Context('parent') parent: ParentEntity,
  ): Promise<any> {
    return this.awardsService.updateAward(awardId, updateAwardGqlDto, parent);
  }

  @Mutation(returns => AwardModel, {
    description:
      'Review award draft.' +
      ' Throws 401 if bearer auth failed for parent.' +
      ' Throws 404 if award not found.' +
      ' Throws 403 if award belongs to child from other family.',
  })
  async reviewAwardDraft(
    @Args('awardId', ParseUUIDPipe) awardId: string,
    @Args('reviewAwardDraftParams') reviewAwardDraftDto: ReviewAwardDraftDto,
    @Context('parent') parent: ParentEntity,
  ): Promise<any> {
    return this.awardsService.reviewAwardDraft(
      awardId,
      reviewAwardDraftDto,
      parent,
    );
  }

  @Mutation(returns => SuccessModel, {
    description:
      'Delete Award for child.' +
      ' Throws 404 if award not found' +
      ' Throws 403 if child is not member of parents family',
  })
  async deleteAward(
    @Args('awardId', ParseUUIDPipe) awardId: string,
    @Context('parent') parent: ParentEntity,
  ): Promise<SuccessModel> {
    await this.awardsService.deleteAwardByParent(awardId, parent);
    return { success: true };
  }
}
