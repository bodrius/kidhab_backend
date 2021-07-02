import {
  Resolver,
  Context,
  Args,
  Query,
  Mutation,
  Info,
} from '@nestjs/graphql';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ParentTokenGraphqlGuard } from '@src/shared/guards/parent-token-graphql.guard';
import { TaskModel } from './task.model';
import { TasksService } from '../common/tasks.service';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { CreateOneTimeTaskDto } from './dto/create-one-time-task.dto';
import { UpdateOneTimeTaskGqlDto } from './dto/update-one-time-task.dto';
import { SuccessModel } from '@src/graphql/success.model';
import { ReviewTaskDto } from './dto/review-task.dto';
import { TaskEntity } from '../common/task.entity';
import { GraphQLResolveInfo } from 'graphql';
import { RelationMapper } from 'typeorm-graphql-joiner';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Resolver(of => TaskModel)
@UseGuards(ParentTokenGraphqlGuard)
export class TasksForParentResolver {
  private relationMapper: RelationMapper;

  constructor(
    @InjectConnection()
    private connection: Connection,
    private tasksService: TasksService,
  ) {
    this.relationMapper = new RelationMapper(this.connection);
  }

  @Query(returns => [TaskModel], {
    description:
      'Gets child tasks for specific date.' +
      ' Throws 404 if child not found.' +
      ' Throws 403 if child is not member of parent family',
  })
  async getChildTasksForDate(
    @Context('parent') parent: ParentEntity,
    @Args('childId') childId: string,
    @Args('date') date: string,
    @Info() info: GraphQLResolveInfo,
  ): Promise<any> {
    const relations = this.relationMapper.buildRelationListForQuery(
      TaskEntity,
      info,
    );
    relations.add('habit');

    return this.tasksService.getTasksForDate(childId, date, parent, [
      ...relations,
    ]);
  }

  @Mutation(returns => TaskModel, {
    description:
      'Create one-time task for child.' +
      ' Throws 401 if bearer authorization failed for parent.' +
      ' Throws 404 if child not found.' +
      ' Throws 403 if child does not belong to parents family.',
  })
  async createOneTimeTask(
    @Args('childId', ParseUUIDPipe) childId: string,
    @Args('createOneTimeTaskParams') createOneTimeTaskDto: CreateOneTimeTaskDto,
    @Context('parent') parent: ParentEntity,
  ): Promise<any> {
    return this.tasksService.createOneTimeTask(
      createOneTimeTaskDto,
      childId,
      parent,
    );
  }

  @Mutation(returns => TaskModel, {
    description:
      'Update one-time task for child.' +
      ' Throws 401 if bearer authorization failed for parent.' +
      ' Throws 404 if task not found.' +
      ' Throws 403 if child does not belong to parents family.',
  })
  async updateOneTimeTask(
    @Args('taskId', ParseUUIDPipe) taskId: string,
    @Args('updateOneTimeTaskParams')
    updateOneTimeTaskDto: UpdateOneTimeTaskGqlDto,
    @Context('parent') parent: ParentEntity,
  ): Promise<any> {
    return this.tasksService.updateOneTimeTask(
      updateOneTimeTaskDto,
      taskId,
      parent,
    );
  }

  @Mutation(returns => SuccessModel, {
    description:
      'Delete one-time task.' +
      ' Throws 401 if bearer authorization failed for parent.' +
      ' Throws 404 if task not found.' +
      ' Throws 403 if child does not belong to parents family.',
  })
  async deleteOneTimeTask(
    @Args('taskId', ParseUUIDPipe) taskId: string,
    @Context('parent') parent: ParentEntity,
  ): Promise<SuccessModel> {
    await this.tasksService.deleteOneTimeTask(taskId, parent);
    return { success: true };
  }

  @Mutation(returns => TaskModel, {
    description:
      'Approve or reject task for child.' +
      ' Throws 401 if bearer authorization failed for parent.' +
      ' Throws 404 if task not found.' +
      ' Throws 403 if child does not belong to parents family.',
  })
  async reviewTask(
    @Args('taskId', ParseUUIDPipe) taskId: string,
    @Args('reviewTaskParams') reviewTaskDto: ReviewTaskDto,
    @Context('parent') parent: ParentEntity,
  ): Promise<any> {
    return this.tasksService.reviewTask(taskId, reviewTaskDto, parent);
  }
}
