import { Resolver, Query, Context, Info } from '@nestjs/graphql';
import { AwardTemplateModel } from './award-template.model';
import { AwardTemplatesService } from '../common/award-templates.service';
import { UseGuards } from '@nestjs/common';
import { CommonTokenGraphqlGuard } from '@src/shared/guards/common-token-graphql.guard';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { RelationMapper } from 'typeorm-graphql-joiner';
import { AwardTemplateEntity } from '../common/award-template.entity';
import { GraphQLResolveInfo } from 'graphql';

@Resolver(of => AwardTemplateModel)
export class AwardTemplatesResolver {
  private relationMapper: RelationMapper;

  constructor(
    @InjectConnection()
    private connection: Connection,
    private awardTemplatesService: AwardTemplatesService,
  ) {
    this.relationMapper = new RelationMapper(this.connection);
  }

  @Query(type => [AwardTemplateModel], {
    description: 'Gets award templates for family',
  })
  @UseGuards(CommonTokenGraphqlGuard)
  async awardTemplates(
    @Context('user') user: ParentEntity | ChildEntity,
    @Info() info: GraphQLResolveInfo,
  ): Promise<AwardTemplateModel[]> {
    const relations = this.relationMapper.buildRelationListForQuery(
      AwardTemplateEntity,
      info,
    );

    return this.awardTemplatesService.getAwardTemplatesForFamily(user.familyId, [...relations]);
  }
}
