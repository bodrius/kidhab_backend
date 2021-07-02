import * as moment from 'moment';
import * as _ from 'lodash';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { TaskEntity } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial } from 'typeorm';
import { dateHelper } from '@src/shared/helpers/date.helper';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { ChildrenService } from '@src/modules/children/common/children.service';
import { HabitEntity } from '../../habits/common/habit.entity';
import { ConfigService } from '@nestjs/config';
import { TaskStatuses } from './task-statuses.enum';
import { CreateOneTimeTaskDto } from '../graphql/dto/create-one-time-task.dto';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { UpdateOneTimeTaskGqlDto } from '../graphql/dto/update-one-time-task.dto';
import {
  ReviewTaskDto,
  StatusesForReview,
} from '../graphql/dto/review-task.dto';
import { ChecksService } from '@src/shared/checks/checks.service';
import { HabitLevelsService } from '../../habits/common/habit-levels.service';
import { PushNotificationsService } from '@src/modules/push-notifications/push-notifications.service';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TasksRepository)
    private tasksRepository: TasksRepository,
    @Inject(forwardRef(() => ChildrenService))
    private childrenService: ChildrenService,
    private habitLevelsService: HabitLevelsService,
    private pushNotificationsService: PushNotificationsService,
    private configService: ConfigService,
    private checksService: ChecksService,
  ) {}

  public async getTasksForDate(
    childId: string,
    date: string,
    parent: ParentEntity,
    relations: string[] = [],
  ): Promise<TaskEntity[]> {
    const child = await this.childrenService.getChild({ id: childId });

    this.checksService.checkEntityExistence(child, childId, 'Child');
    this.checksService.checkSameFamily(child, parent);

    return this.getChildTasksForDate(child, date, relations);
  }

  public async getChildTasksForDate(
    child: ChildEntity,
    date: string,
    relations: string[] = [],
  ): Promise<TaskEntity[]> {
    const targetISODate = dateHelper.getISODate(date);

    return this.tasksRepository.find({
      where: { child, date: targetISODate },
      relations,
    });
  }

  public async createTasksForHabit(habit: HabitEntity): Promise<TaskEntity[]> {
    const { baseDate, timesToCompleteLeft } = habit;

    const createTasksCount =
      timesToCompleteLeft ||
      this.configService.get<number>('general.defaultTaskNumberToCreate');

    return this.tasksRepository.save(
      this.composeTasksForHabit(
        habit,
        createTasksCount,
        moment(dateHelper.getISODate(baseDate)),
      ),
    );
  }

  public async createOneTimeTask(
    createOneTimeTaskDto: CreateOneTimeTaskDto,
    childId: string,
    parent: ParentEntity,
  ): Promise<TaskEntity> {
    const child = await this.childrenService.getChild({ id: childId });

    this.checksService.checkEntityExistence(child, childId, 'Child');
    this.checksService.checkSameFamily(child, parent);

    const task = await this.saveOneTimeTask(createOneTimeTaskDto, child);

    await this.pushNotificationsService.sendOneTimeTaskAdded(task);

    return task;
  }

  public async updateOneTimeTask(
    updateOneTimeTaskDto: UpdateOneTimeTaskGqlDto,
    taskId: string,
    parent: ParentEntity,
  ): Promise<TaskEntity> {
    const task = await this.tasksRepository.findOne(taskId, {
      relations: ['child'],
    });

    this.checksService.checkEntityExistence(task, taskId, 'Task');
    this.checksService.checkSameFamily(task.child, parent);
    this.checksService.checkOneTimeTask(task);
    this.checksService.checkTaskNotProcessed(task);

    return this.updateOneTimeTaskEntity(task, updateOneTimeTaskDto);
  }

  public async deleteOneTimeTask(
    taskId: string,
    parent: ParentEntity,
  ): Promise<void> {
    const task = await this.tasksRepository.findOne(taskId, {
      relations: ['child'],
    });

    this.checksService.checkEntityExistence(task, taskId, 'Task');
    this.checksService.checkSameFamily(task.child, parent);
    this.checksService.checkOneTimeTask(task);
    this.checksService.checkTaskCouldBeDeleted(task);

    await this.tasksRepository.remove(task);
  }

  public async sendTaskForApproval(
    taskId: string,
    child: ChildEntity,
  ): Promise<TaskEntity> {
    const task = await this.tasksRepository.findOne(taskId, {
      relations: ['habit'],
    });

    this.checksService.checkEntityExistence(task, taskId, 'Task');
    this.checksService.checkChildAuthor(child, task, 'Task');
    this.checksService.checkTaskReadyForApproval(task);

    const { habit } = task;
    const updatedTask = await this.updateTask(task, {
      name: habit?.name ?? task.name,
      description: habit?.description ?? task.description,
      totalPoints: habit?.pointsRate ?? task.totalPoints,
      imageUrl: habit?.imageUrl ?? task.imageUrl,
      status: TaskStatuses.PENDING_APPROVAL,
    });

    await this.pushNotificationsService.sendWaitingForApprovalMessage(
      task,
      child,
    );

    return updatedTask;
  }

  public async reviewTask(
    taskId: string,
    reviewTaskDto: ReviewTaskDto,
    parent: ParentEntity,
  ): Promise<TaskEntity> {
    const task = await this.tasksRepository.findOne(taskId, {
      relations: ['habit', 'child'],
    });

    this.checksService.checkEntityExistence(task, taskId, 'Task');
    this.checksService.checkSameFamily(task.child, parent);
    this.checksService.checkTaskPendingApproval(task);

    const updatedTask = await this.updateTask(task, {
      status: (reviewTaskDto.status as unknown) as TaskStatuses,
    });

    const shouldAddPoints = reviewTaskDto.status === StatusesForReview.APPROVED;
    if (shouldAddPoints) {
      await this.childrenService.incrementBalance(
        task.childId,
        updatedTask.totalPoints,
      );
      const updatedHabit = await this.habitLevelsService.incrementHabitLevel(
        task.habit,
        task.child,
      );
      updatedTask.habit = updatedHabit;
    }

    await this.pushNotificationsService.sendReviewedMessage(
      updatedTask,
      updatedTask.child,
    );

    return updatedTask;
  }

  public async rescheduleTasksForHabit(
    habit: HabitEntity,
    prevReccurence: string,
  ): Promise<void> {
    if (prevReccurence === habit.reccurence) {
      return;
    }

    await this.deleteTasksForHabit(habit.id);
    await this.createTasksForHabit(habit);
  }

  public async deleteTasksForHabit(habitId: string): Promise<void> {
    await this.tasksRepository.delete({
      habit: { id: habitId },
      status: TaskStatuses.CREATED,
    });
  }

  public async markTasksOverdue(tasks: TaskEntity[]): Promise<TaskEntity[]> {
    const tasksToUpdate = tasks.map(task =>
      this.tasksRepository.merge(task, { status: TaskStatuses.OVERDUE }),
    );

    return this.tasksRepository.save(tasksToUpdate);
  }

  public async deleteLastTasksForHabit(
    habitId: string,
    tasksToDeleteCount: number,
  ): Promise<void> {
    return this.tasksRepository.deleteLastTasksForHabit(
      habitId,
      tasksToDeleteCount,
    );
  }

  public composeTasksForHabit(
    habit: HabitEntity,
    createTasksCount: number,
    baseDate: moment.Moment,
  ): TaskEntity[] {
    const tasksToCreate: TaskEntity[] = [];
    const durationBetweenTasks = this.getDurationBetweenTasks(habit);

    for (let i = 0; i < createTasksCount; i++) {
      tasksToCreate.push({
        date: moment(baseDate)
          .add(+durationBetweenTasks * i)
          .format('YYYY-MM-DD'),
        habit,
        child: habit.child || { id: habit.childId },
      } as TaskEntity);
    }

    return tasksToCreate;
  }

  public getDurationBetweenTasks(habit: HabitEntity): moment.Duration {
    const { reccurence } = habit;

    return typeof reccurence === 'object'
      ? moment.duration(reccurence)
      : moment.duration(...reccurence.split(' '));
  }

  private async saveOneTimeTask(
    createOneTimeTaskDto: CreateOneTimeTaskDto,
    child: ChildEntity,
  ) {
    return this.tasksRepository.save({
      ..._.omit(createOneTimeTaskDto, 'points'),
      date: dateHelper.getISODate(createOneTimeTaskDto.date),
      child,
      totalPoints: createOneTimeTaskDto.points,
    });
  }

  private updateOneTimeTaskEntity(
    task: TaskEntity,
    updateOneTimeTaskDto: UpdateOneTimeTaskGqlDto,
  ) {
    const updateParams: Partial<TaskEntity> = _.cloneDeep(
      _.omit(updateOneTimeTaskDto, 'points', 'date'),
    );
    if (updateOneTimeTaskDto.date) {
      updateParams.date = moment(updateOneTimeTaskDto.date).format(
        'YYYY-MM-DD',
      );
    }
    if (updateOneTimeTaskDto.points) {
      updateParams.totalPoints = updateOneTimeTaskDto.points;
    }

    return this.updateTask(task, updateParams);
  }

  private updateTask(
    task: TaskEntity,
    updateParams: DeepPartial<TaskEntity>,
  ): Promise<TaskEntity> {
    const taskToUpdate = this.tasksRepository.merge(task, updateParams);
    return this.tasksRepository.save(taskToUpdate);
  }
}
