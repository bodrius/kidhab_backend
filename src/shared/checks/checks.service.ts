import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as _ from 'lodash';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { HabitEntity } from '@src/modules/habits-management/habits/common/habit.entity';
import { AwardEntity } from '@src/modules/awards-management/awards/common/award.entity';
import { HabitsStatuses } from '@src/modules/habits-management/habits/common/habits-statuses.enum';
import { TaskStatuses } from '@src/modules/habits-management/tasks/common/task-statuses.enum';
import { TaskEntity } from '@src/modules/habits-management/tasks/common/task.entity';
import { NotificationForParentEntity } from '@src/modules/notifications/notifications-for-parent/common/notification-for-parent.entity';
import { AwardStatuses } from '@src/modules/awards-management/awards/common/award-statuses.enum';

type EntityWithDraft = HabitEntity | AwardEntity;

type ChildsEntity = HabitEntity | AwardEntity | TaskEntity;

interface FamilyOrSystemEntity {
  id: string;
  familyId?: string;
}

@Injectable()
export class ChecksService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  checkEntityExistence(entity: unknown, id: string, name: string): void {
    if (!entity) {
      throw new NotFoundException(`${name} '${id}' not found`);
    }
  }

  checkEntitiesExistence(
    entities: FamilyOrSystemEntity[] = [],
    ids: string[],
    name: string,
  ): void {
    if (entities.length !== ids.length) {
      const entityIds = entities.map(e => e.id);
      const notFoundIds = _.difference(ids, entityIds);

      throw new NotFoundException(
        `${name} with ids '${notFoundIds}' not found`,
      );
    }
  }

  checkDraftExistance(entity: EntityWithDraft, id: string, name: string): void {
    if (!entity.draft) {
      throw new NotFoundException(`${name}'s ${id} draft not found`);
    }
  }

  checkSameFamily(child: ChildEntity, parent: ParentEntity): void {
    if (child.familyId !== parent.familyId) {
      throw new ForbiddenException(
        `Parent cannot control entities from foreign families`,
      );
    }
  }

  checkChildAuthor(
    child: ChildEntity,
    entity: ChildsEntity,
    name: string,
  ): void {
    if (child.id !== entity.childId) {
      throw new ForbiddenException(`Cannot rule ${name} of other child`);
    }
  }

  checkChildInfoPassedGql(ctxChild: ChildEntity, childId: string): void {
    if (!ctxChild && !childId) {
      throw new BadRequestException(
        'Child id not provided or createChild mutation does not preceded habits creation',
      );
    }
  }

  checkHabitNotCompleted(habit: HabitEntity): void {
    if (habit.status === HabitsStatuses.COMPLETED) {
      throw new ForbiddenException('Cannot change completed habit');
    }
  }

  checkHabitDeletionRequested(habit: HabitEntity): void {
    if (habit.status !== HabitsStatuses.DELETION_REQUESTED) {
      throw new ForbiddenException('Cannot delete habit');
    }
  }

  checkTaskNotProcessed(task: TaskEntity): void {
    if (task.status !== TaskStatuses.CREATED) {
      throw new ForbiddenException(
        'Task is already processed. Cannot change processed task',
      );
    }
  }

  checkTaskCouldBeDeleted(task: TaskEntity): void {
    if (![TaskStatuses.CREATED, TaskStatuses.REJECTED].includes(task.status)) {
      throw new ForbiddenException(
        'Task is finished or in review process. Cannot delete',
      );
    }
  }

  checkTaskPendingApproval(task: TaskEntity): void {
    if (task.status !== TaskStatuses.PENDING_APPROVAL) {
      throw new ForbiddenException(
        `Parent cannot review task which child haven't send for review`,
      );
    }
  }

  checkOneTimeTask(task: TaskEntity): void {
    if (task.habitId) {
      throw new ForbiddenException(
        'Tasks related to habits cannot be changed through this endpoint',
      );
    }
  }

  checkTaskReadyForApproval(task: TaskEntity): void {
    if (![TaskStatuses.CREATED, TaskStatuses.REJECTED].includes(task.status)) {
      throw new ForbiddenException(
        'Cannot send for approval task, which status in not created nor rejected',
      );
    }
  }

  checkParentNotificationReceiver(
    notification: NotificationForParentEntity,
    parent: ParentEntity,
  ): void {
    if (notification.parentReceiverId !== parent.id) {
      throw new ForbiddenException(`Parent cannot delete not his notification`);
    }
  }

  checkAwardPurchased(award: AwardEntity): void {
    if (award.status === AwardStatuses.PURCHASED) {
      throw new ForbiddenException('Cannot manipulate purchased award');
    }
  }
}
