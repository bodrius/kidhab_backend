import {
  Resolver,
  Context,
  Args,
  Query,
  Mutation,
  Info,
} from '@nestjs/graphql';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { TaskModel } from './task.model';
import { TasksService } from '../common/tasks.service';
import { ChildTokenGraphqlGuard } from '@src/shared/guards/child-token-graphql.guard';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { TaskEntity } from '../common/task.entity';
import { GraphQLResolveInfo } from 'graphql';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { RelationMapper } from 'typeorm-graphql-joiner';

@Resolver(of => TaskModel)
@UseGuards(ChildTokenGraphqlGuard)
export class TasksForChildResolver {
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
  async getLoggedChildTasksForDate(
    @Context('child') child: ChildEntity,
    @Args('date') date: string,
    @Info() info: GraphQLResolveInfo,
  ): Promise<any> {
    const relations = this.relationMapper.buildRelationListForQuery(
      TaskEntity,
      info,
    );
    relations.add('habit');

    return this.tasksService.getChildTasksForDate(child, date, [...relations]);
  }

  @Mutation(returns => TaskModel, {
    description:
      'Send done task for approval.' +
      ' Throws 401 if bearer auth failed for child.' +
      ' Throws 404 if task not found.' +
      ' Throws 403 if task does not belong to child',
  })
  async sendTaskForApproval(
    @Args('taskId', ParseUUIDPipe) taskId: string,
    @Context('child') child: ChildEntity,
  ): Promise<any> {
    return this.tasksService.sendTaskForApproval(taskId, child);
  }
}
