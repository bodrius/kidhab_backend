import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { TaskModel } from '@src/modules/habits-management/tasks/graphql/task.model';
import { TaskEntity } from '@src/modules/habits-management/tasks/common/task.entity';
import { ChildrenService } from '../common/children.service';
import { ChildEntity } from '../common/child.entity';

@Resolver(of => TaskModel)
export class TasksChildResolver {
  constructor(private childrenService: ChildrenService) {}

  @ResolveField()
  async child(@Parent() task: TaskEntity): Promise<ChildEntity> {
    return task.child || this.childrenService.getChild({ id: task.childId });
  }
}
