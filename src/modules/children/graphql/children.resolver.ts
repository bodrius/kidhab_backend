import {
  Resolver,
  Mutation,
  Args,
  Context,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ChildModel } from './child.model';
import { CreateChildDto } from './dto/create-child.dto';
import { ChildrenService } from '../common/children.service';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { UseGuards } from '@nestjs/common';
import { ParentTokenGraphqlGuard } from '@src/shared/guards/parent-token-graphql.guard';
import { HabitCategoryModel } from '@src/modules/habits-management/habit-categories/graphql/habit-category.model';
import { ChildEntity } from '../common/child.entity';
import { GqlContext } from '@src/graphql/graphql-context.interface';
import { UpdateLoggedChildDto } from './dto/update-logged-child.dto';
import { ChildTokenGraphqlGuard } from '@src/shared/guards/child-token-graphql.guard';

@Resolver(of => ChildModel)
export class ChildrenResolver {
  constructor(private childrenService: ChildrenService) {}

  @Mutation(returns => ChildModel, {
    description:
      'Create new child in family.' +
      ' Throws 404 if some of category ids not found in DB',
  })
  @UseGuards(ParentTokenGraphqlGuard)
  async createChild(
    @Context() ctx: GqlContext,
    @Context('parent') parent: ParentEntity,
    @Args() createChildDto: CreateChildDto,
  ): Promise<any> {
    const child = await this.childrenService.createChild(
      parent,
      createChildDto,
    );
    ctx.child = child;

    return child;
  }

  @Query(returns => [ChildModel], {
    description: 'Gets all childrens of current family',
  })
  @UseGuards(ParentTokenGraphqlGuard)
  async children(@Context('parent') parent: ParentEntity): Promise<any> {
    return this.childrenService.getFamilyChildrenWithAwardsAndHabits(
      parent.familyId,
    );
  }

  @Mutation(returns => ChildModel, {
    description:
      'Upsert invite hash for child.' +
      ' Throws 404 if child not found.' +
      ' Throws 403 if child is not member of parents family',
  })
  @UseGuards(ParentTokenGraphqlGuard)
  async upsertInviteHashForChild(
    @Context('parent') parent: ParentEntity,
    @Args('childId') childId: string,
  ): Promise<any> {
    return this.childrenService.upsertInviteHash(childId, parent);
  }

  @Mutation(returns => ChildModel, { description: 'Updates logged child.' })
  @UseGuards(ChildTokenGraphqlGuard)
  async updateLoggedChild(
    @Context('child') child: ChildEntity,
    @Args() updateLoggedChildDto: UpdateLoggedChildDto,
  ): Promise<any> {
    return this.childrenService.updateChild(child, updateLoggedChildDto);
  }

  @ResolveField(type => [HabitCategoryModel])
  async categories(@Parent() child: ChildEntity): Promise<any> {
    const childWithCategories = await this.childrenService.getChild({
      where: { id: child.id },
      relations: ['categories'],
    });

    return childWithCategories.categories;
  }
}
