import { Injectable, Inject, forwardRef } from '@nestjs/common';
import * as _ from 'lodash';
import { HabitEntity } from './habit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateHabitDto } from './dto/create-habit.dto';
import { HabitCategoriesService } from '../../habit-categories/common/habit-categories.service';
import { ChildrenService } from '@src/modules/children/common/children.service';
import { UpdateHabitGqlDto } from './dto/update-habit.dto';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { CreateHabitsDto } from './dto/create-habits.dto';
import { dateHelper } from '@src/shared/helpers/date.helper';
import { TasksService } from '../../tasks/common/tasks.service';
import { HabitsStatuses } from './habits-statuses.enum';
import { HabitApprovalDto } from './dto/habit-approval.dto';
import { NotificationsForParentService } from '@src/modules/notifications/notifications-for-parent/common/notifications-for-parent.service';
import { ParentNotificationsTypes } from '@src/shared/interfaces/parent-notifications-types.enum';
import { HabitsRepository } from './habits.repository';
import { ChecksService } from '@src/shared/checks/checks.service';
import { HabitLevelsService } from './habit-levels.service';
import { PushNotificationsService } from '@src/modules/push-notifications/push-notifications.service';
import { HabitTemplatesService } from '../../habit-templates/common/habit-templates.service';
import { HabitTemplateEntity } from '../../habit-templates/common/habit-template.entity';
import { AppendTasksService } from '../crons/append-tasks/append-tasks.service';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(HabitsRepository)
    private habitsRepository: HabitsRepository,
    private habitLevelsService: HabitLevelsService,
    private habitCategoriesService: HabitCategoriesService,
    @Inject(forwardRef(() => ChildrenService))
    private childrenService: ChildrenService,
    private tasksService: TasksService,
    private notificationsForParentService: NotificationsForParentService,
    private pushNotificationsService: PushNotificationsService,
    private checksService: ChecksService,
    private habitTemplatesService: HabitTemplatesService,
    private appendTasksService: AppendTasksService,
  ) {}

  async createHabits(
    createHabitsDto: CreateHabitsDto,
    parent: ParentEntity,
    ctxChild?: ChildEntity,
  ): Promise<HabitEntity[]> {
    const { childId, habits } = createHabitsDto;
    const categoryIds = habits.map(habit => habit.categoryId);

    this.checksService.checkChildInfoPassedGql(ctxChild, childId);
    await Promise.all(
      categoryIds.map(id => this.habitCategoriesService.checkCategoryId(id)),
    );

    const habitTemplateIds = this.getHabitTemplateIds(habits);
    const habitTemplates = await this.habitTemplatesService.getHabitTemplatesByIds(
      habitTemplateIds,
    );

    this.checksService.checkEntitiesExistence(
      habitTemplates,
      habitTemplateIds,
      'Habit Template',
    );

    let child: ChildEntity;
    if (childId) {
      child = await this.childrenService.getChild({ id: childId });
    } else {
      child = ctxChild;
    }

    this.checksService.checkSameFamily(child, parent);

    return this.createHabitsWithTasks(
      habits.map(habit =>
        this.composeHabit(habit, child, habit.categoryId, habitTemplates),
      ),
    );
  }

  async createHabitFromDraft(
    createHabitDto: CreateHabitDto,
    child: ChildEntity,
  ): Promise<HabitEntity> {
    const { categoryId, templateId } = createHabitDto;
    const category = await this.habitCategoriesService.getCategory({
      id: categoryId,
    });
    this.checksService.checkEntityExistence(
      category,
      createHabitDto.categoryId,
      'Habit Category',
    );

    const habitToCreate = this.habitsRepository.merge(new HabitEntity(), {
      status: HabitsStatuses.DRAFT_CREATED,
      child,
      draft: createHabitDto,
    });

    if (templateId) {
      const [
        habitTemplate,
      ] = await this.habitTemplatesService.getHabitTemplatesByIds([templateId]);
      this.checksService.checkEntityExistence(
        habitTemplate,
        templateId,
        'Habit Template',
      );
      const { name, translations } = this.getNameAndTranslations(templateId, [
        habitTemplate,
      ]);

      habitToCreate.draft.name = name;
      habitToCreate.draft.translations = translations;
    }

    const newHabit = await this.habitsRepository.save(habitToCreate);

    const notifications = await this.notificationsForParentService.addHabitNotificationForFamilyParents(
      newHabit.id,
      child,
      ParentNotificationsTypes.HABIT_CREATION_REQUESTED,
    );
    await this.pushNotificationsService.sendHabitDraftChange(
      notifications,
      child,
      true,
    );

    return newHabit;
  }

  async getChildHabits(
    childId: string,
    parent: ParentEntity,
    relations: string[] = [],
  ): Promise<HabitEntity[]> {
    const child = await this.validateChild(childId, parent);

    return this.getHabitsByChild(child, relations);
  }

  async getHabitsByChild(
    child: ChildEntity,
    relations: string[] = [],
  ): Promise<HabitEntity[]> {
    return this.habitsRepository.findHabitsForChild(child, relations);
  }

  async updateChildHabit(
    updateHabitDto: UpdateHabitGqlDto,
    habitId: string,
    parent: ParentEntity,
  ): Promise<HabitEntity> {
    const { categoryId } = updateHabitDto;
    const habit = await this.habitsRepository.findHabit({ id: habitId });

    this.checksService.checkEntityExistence(habit, habitId, 'Habit');
    await this.validateChild(habit.childId, parent);
    if (categoryId) {
      const category = await this.habitCategoriesService.getCategory({
        id: categoryId,
      });
      this.checksService.checkEntityExistence(
        category,
        categoryId,
        'Habit Category',
      );
    }
    this.checksService.checkHabitNotCompleted(habit);

    const prevReccurence = habit.reccurence;
    const updatedHabit = await this.habitsRepository.updateHabit(
      habit,
      updateHabitDto,
    );
    await this.tasksService.rescheduleTasksForHabit(
      updatedHabit,
      prevReccurence,
    );
    await this.updateTimesToComplete(habit, updatedHabit);

    return updatedHabit;
  }

  async updateChildHabitDraft(
    updateHabitDto: UpdateHabitGqlDto,
    habitId: string,
    child: ChildEntity,
  ): Promise<HabitEntity> {
    const { categoryId } = updateHabitDto;
    const habit = await this.habitsRepository.findHabit({ id: habitId });

    if (categoryId) {
      const category = await this.habitCategoriesService.getCategory({
        id: categoryId,
      });
      this.checksService.checkEntityExistence(
        category,
        categoryId,
        'Habit Category',
      );
    }
    this.checksService.checkEntityExistence(habit, habitId, 'Habit');
    this.checksService.checkChildAuthor(child, habit, 'Habit');

    const updatedHabit = await this.habitsRepository.updateHabit(habit, {
      draft: updateHabitDto,
    });

    const notifications = await this.notificationsForParentService.addHabitNotificationForFamilyParents(
      updatedHabit.id,
      child,
      ParentNotificationsTypes.HABIT_UPDATE_REQUESTED,
    );
    await this.pushNotificationsService.sendHabitDraftChange(
      notifications,
      child,
      false,
    );

    return updatedHabit;
  }

  async reviewHabitDraft(
    habitId: string,
    habitApprovalDto: HabitApprovalDto,
    parent: ParentEntity,
  ): Promise<HabitEntity> {
    const habit = await this.habitsRepository.findHabit(
      { id: habitId },
      { relations: ['child'] },
    );

    this.checksService.checkEntityExistence(habit, habitId, 'Habit');
    this.checksService.checkDraftExistance(habit, habitId, 'Habit');
    this.checksService.checkSameFamily(habit.child, parent);
    this.checksService.checkHabitNotCompleted(habit);

    if (habitApprovalDto.approve) {
      const approvedHabit = await this.approveHabit(habit);
      await this.habitLevelsService.assignFirstLevel(approvedHabit);
    } else if (
      !habitApprovalDto.approve &&
      habit.status === HabitsStatuses.DRAFT_CREATED
    ) {
      await this.habitsRepository.updateHabit(habit, {
        draft: null,
        status: HabitsStatuses.DELETED,
      });
    } else {
      await this.habitsRepository.updateHabit(habit, {
        draft: null,
      });
    }

    return this.habitsRepository.findOne(habit.id);
  }

  async reviewHabitDeletion(
    habitId: string,
    habitApprovalDto: HabitApprovalDto,
    parent: ParentEntity,
  ): Promise<HabitEntity> {
    const habit = await this.habitsRepository.findHabit(
      { id: habitId },
      { relations: ['child'] },
    );

    this.checksService.checkEntityExistence(habit, habitId, 'Habit');
    this.checksService.checkSameFamily(habit.child, parent);
    this.checksService.checkHabitDeletionRequested(habit);

    let updatedHabit: HabitEntity;
    if (habitApprovalDto.approve) {
      updatedHabit = await this.habitsRepository.updateHabit(habit, {
        status: HabitsStatuses.DELETED,
      });

      await this.tasksService.deleteTasksForHabit(habitId);
      await this.notificationsForParentService.removeNotificationsForHabit(
        habitId,
      );
    } else {
      updatedHabit = await this.habitsRepository.updateHabit(habit, {
        status: HabitsStatuses.IN_PROGRESS,
      });
    }

    return updatedHabit;
  }

  async deleteHabit(habitId: string, parent: ParentEntity): Promise<void> {
    const habit = await this.habitsRepository.findHabit({ id: habitId });

    this.checksService.checkEntityExistence(habit, habitId, 'Habit');
    await this.validateChild(habit.childId, parent);
    this.checksService.checkHabitNotCompleted(habit);

    await this.habitsRepository.update(
      { id: habitId },
      { status: HabitsStatuses.DELETED },
    );
    await this.tasksService.deleteTasksForHabit(habitId);
    await this.notificationsForParentService.removeNotificationsForHabit(
      habitId,
    );
  }

  async requestHabitDeletion(
    habitId: string,
    child: ChildEntity,
  ): Promise<HabitEntity> {
    const habit = await this.habitsRepository.findHabit({ id: habitId });

    this.checksService.checkEntityExistence(habit, habitId, 'Habit');
    this.checksService.checkChildAuthor(child, habit, 'Habit');

    const updatedHabit = await this.habitsRepository.updateHabit(habit, {
      status: HabitsStatuses.DELETION_REQUESTED,
    });

    const notifications = await this.notificationsForParentService.addHabitNotificationForFamilyParents(
      updatedHabit.id,
      child,
      ParentNotificationsTypes.HABIT_DELETION_REQUESTED,
    );

    await this.pushNotificationsService.sendHabitDeletionRequested(
      notifications,
      child,
    );

    return updatedHabit;
  }

  private async validateChild(childId: string, parent: ParentEntity) {
    const child = await this.childrenService.getChild({ id: childId });

    this.checksService.checkEntityExistence(child, childId, 'Child');
    this.checksService.checkSameFamily(child, parent);

    return child;
  }

  private async createHabitsWithTasks(childHabits: HabitEntity[]) {
    const habitsCreated = await this.habitsRepository.save(childHabits);

    await Promise.all(
      habitsCreated.map(habit => this.tasksService.createTasksForHabit(habit)),
    );
    await Promise.all(
      habitsCreated.map(habit =>
        this.habitLevelsService.assignFirstLevel(habit),
      ),
    );

    return habitsCreated;
  }

  private async approveHabit(habit: HabitEntity) {
    const isHabitCreatedFromDraft =
      habit.status === HabitsStatuses.DRAFT_CREATED;
    const prevReccurence = habit.reccurence;

    const updatedHabit = await this.habitsRepository.updateHabit(habit, {
      ...habit.draft,
      timesToCompleteLeft: isHabitCreatedFromDraft
        ? habit.draft.timesToComplete
        : habit.timesToCompleteLeft,
      status: HabitsStatuses.IN_PROGRESS,
      draft: null,
    });

    if (isHabitCreatedFromDraft) {
      await this.tasksService.createTasksForHabit(updatedHabit);
    } else {
      await this.tasksService.rescheduleTasksForHabit(
        updatedHabit,
        prevReccurence,
      );
    }

    return updatedHabit;
  }

  private async updateTimesToComplete(
    oldHabit: HabitEntity,
    newHabit: HabitEntity,
  ) {
    if (oldHabit.timesToComplete === newHabit.timesToComplete) {
      return newHabit;
    }

    let updatedHabit: HabitEntity;

    const tasksCompletedCount =
      oldHabit.timesToComplete - oldHabit.timesToCompleteLeft;

    if (tasksCompletedCount >= newHabit.timesToComplete) {
      await this.tasksService.deleteTasksForHabit(newHabit.id);
      updatedHabit = await this.habitsRepository.updateHabit(newHabit, {
        status: HabitsStatuses.COMPLETED,
        timesToCompleteLeft: 0,
        timesToCompleteLevelLeft: 0,
      });
    }

    if (tasksCompletedCount < newHabit.timesToComplete) {
      const timesToCompleteDiff =
        newHabit.timesToComplete - oldHabit.timesToComplete;

      await this.habitsRepository.updateHabit(newHabit, {
        timesToCompleteLeft: oldHabit.timesToCompleteLeft + timesToCompleteDiff,
      });
      const habitWithTasksToAdd = await this.habitsRepository.getHabitWithStats(
        newHabit.id,
      );
      if (habitWithTasksToAdd.tasksToAdd > 0) {
        await this.appendTasksService.addNewTasksToHabit(habitWithTasksToAdd);
      }
      if (habitWithTasksToAdd.tasksToAdd < 0) {
        await this.tasksService.deleteLastTasksForHabit(
          habitWithTasksToAdd.id,
          -habitWithTasksToAdd.tasksToAdd,
        );
      }
    }

    return updatedHabit;
  }

  private composeHabit(
    createHabitDto: CreateHabitDto,
    child: ChildEntity,
    categoryId: string,
    habitTemplates: HabitTemplateEntity[] = null,
  ): HabitEntity {
    const habit = this.habitsRepository.merge(
      new HabitEntity(),
      createHabitDto,
    );

    habit.pointsRate = createHabitDto.points;
    habit.timesToCompleteLeft = createHabitDto.timesToComplete;
    habit.child = child;
    habit.baseDate = dateHelper.getISODate(createHabitDto.baseDate);
    (habit as any).category = { id: categoryId };

    if (createHabitDto.templateId && habitTemplates) {
      const { name, translations } = this.getNameAndTranslations(
        createHabitDto.templateId,
        habitTemplates,
      );
      habit.name = name;
      habit.translations = translations;
    }

    return habit;
  }

  getNameAndTranslations(
    templateId: string,
    habitTemplates: HabitTemplateEntity[],
  ) {
    const habitTemplate = habitTemplates.find(
      template => template.id === templateId,
    );

    return {
      name: habitTemplate.name,
      translations: habitTemplate.translations,
    };
  }

  getHabitTemplateIds(habits: CreateHabitDto[]): string[] {
    const habitTemplateIds = habits
      .map(habitDto => habitDto.templateId)
      .filter(Boolean);
    return _.uniq(habitTemplateIds);
  }
}
