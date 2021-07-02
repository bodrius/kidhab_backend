import { Resolver, Query, Context, Info } from '@nestjs/graphql';
import { ParentModel } from '@src/modules/parents/graphql/parent.model';
import { FamiliesService } from '../common/families.service';
import { FamilyModel } from './family.model';
import { UseGuards } from '@nestjs/common';
import { CommonTokenGraphqlGuard } from '@src/shared/guards/common-token-graphql.guard';
import { ChildModel } from '@src/modules/children/graphql/child.model';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { RelationMapper } from 'typeorm-graphql-joiner';
import { FamilyEntity } from '../common/family.entity';
import { GraphQLResolveInfo } from 'graphql';

@Resolver(of => FamilyModel)
export class FamiliesResolver {
  private relationMapper: RelationMapper;

  constructor(
    @InjectConnection()
    private connection: Connection,
    private familiesService: FamiliesService,
  ) {
    this.relationMapper = new RelationMapper(this.connection);
  }

  @UseGuards(CommonTokenGraphqlGuard)
  @Query(returns => FamilyModel, {
    description: 'Get info about current family',
  })
  async getFamily(
    @Context('user') user: ParentModel | ChildModel,
    @Info() info: GraphQLResolveInfo,
  ): Promise<any> {
    const relations = this.relationMapper.buildRelationListForQuery(
      FamilyEntity,
      info,
    );

    return this.familiesService.getById(user.familyId, [...relations]);
  }
}
