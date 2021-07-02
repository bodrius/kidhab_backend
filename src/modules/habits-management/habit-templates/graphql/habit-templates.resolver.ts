import { Resolver, Query, Context, Info } from '@nestjs/graphql';
import { HabitTemplateModel } from './habit-template.model';
import { HabitTemplatesService } from '../common/habit-templates.service';
import { UseGuards } from '@nestjs/common';
import { CommonTokenGraphqlGuard } from '@src/shared/guards/common-token-graphql.guard';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { RelationMapper } from 'typeorm-graphql-joiner';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { GraphQLResolveInfo } from 'graphql';
import { HabitTemplateEntity } from '../common/habit-template.entity';

@Resolver(of => HabitTemplateModel)
export class HabitTemplatesResolver {
  private relationMapper: RelationMapper;

  constructor(
    @InjectConnection()
    private connection: Connection,
    private habitTemplatesService: HabitTemplatesService,
  ) {
    this.relationMapper = new RelationMapper(this.connection);
  }

  @Query(returns => [HabitTemplateModel], {
    description: 'Get habit templates for family',
  })
  @UseGuards(CommonTokenGraphqlGuard)
  async habitTemplates(
    @Context('user') user: ParentEntity | ChildEntity,
    @Info() info: GraphQLResolveInfo,
  ): Promise<any[]> {
    const relations = this.relationMapper.buildRelationListForQuery(
      HabitTemplateEntity,
      info,
    );

    return this.habitTemplatesService.getHabitTemplatesByFamily(user.familyId, [
      ...relations,
    ]);
  }
}
