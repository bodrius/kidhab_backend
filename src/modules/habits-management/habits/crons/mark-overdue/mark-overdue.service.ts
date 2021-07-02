import * as _ from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { TaskStatuses } from '../../../tasks/common/task-statuses.enum';
import {
  HabitAndTaskIds,
  HabitsRepository,
} from '../../common/habits.repository';
import { HabitLevelsService } from '../../common/habit-levels.service';
import { sleep } from '@src/shared/helpers/sleep.helper';
import { TasksRepository } from '@src/modules/habits-management/tasks/common/tasks.repository';

@Injectable()
export class MarkOverdueService {
  private readonly logger = new Logger(MarkOverdueService.name);
  private readonly HABITS_CHUNK_QTY = 10;
  private readonly PAUSE_BETWEEN_CHUNKS = 500;

  constructor(
    @InjectRepository(HabitsRepository)
    private habitsRepository: HabitsRepository,
    @InjectRepository(TasksRepository)
    private tasksRepository: TasksRepository,
    private habitLevelsService: HabitLevelsService,
  ) {}

  async updateHabitsAndTasks(): Promise<void> {
    this.logger.debug('cron started');

    let habitsProcessed = 0;
    const habitsToProcessCount = await this.habitsRepository.countHabitsWithExpiredTasks();

    let habitsChunk = await this.habitsRepository.getHabitsWithExpiredTasksChunk(
      this.HABITS_CHUNK_QTY,
    );

    while (habitsChunk.length) {
      await Promise.all(habitsChunk.map(habit => this.processHabit(habit)));

      habitsProcessed += habitsChunk.length;

      habitsChunk = await this.habitsRepository.getHabitsWithExpiredTasksChunk(
        this.HABITS_CHUNK_QTY,
      );
      this.logger.debug(
        `processed ${habitsProcessed} out of ${habitsToProcessCount} habits`,
      );
      await sleep(this.PAUSE_BETWEEN_CHUNKS);
    }

    this.logger.debug('cron finished');
  }

  private async processHabit(habit: HabitAndTaskIds) {
    await this.habitLevelsService.resetHabitLevelProgress(habit);
    await this.markTasksOverdue(habit.taskIds);
  }

  private markTasksOverdue(taskIds: string[]) {
    return this.tasksRepository.update(
      { id: In(taskIds) },
      { status: TaskStatuses.OVERDUE },
    );
  }
}
