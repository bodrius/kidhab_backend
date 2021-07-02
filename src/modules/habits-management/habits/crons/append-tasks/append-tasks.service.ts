import * as moment from 'moment-timezone';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TasksService } from '../../../tasks/common/tasks.service';
import { HabitsRepository, HabitStats } from '../../common/habits.repository';
import { sleep } from '@src/shared/helpers/sleep.helper';
import { ConfigService } from '@nestjs/config';
import { TasksRepository } from '@src/modules/habits-management/tasks/common/tasks.repository';

@Injectable()
export class AppendTasksService {
  private readonly logger = new Logger(AppendTasksService.name);
  private readonly HABITS_CHUNK_QTY = 10;
  private readonly PAUSE_BETWEEN_CHUNKS = 500;
  private DEFAULT_TASKS_NUMBER_TO_CREATE: number;

  constructor(
    @InjectRepository(HabitsRepository)
    private habitsRepository: HabitsRepository,
    @InjectRepository(TasksRepository)
    private tasksRepository: TasksRepository,
    private tasksService: TasksService,
    private configService: ConfigService,
  ) {
    this.DEFAULT_TASKS_NUMBER_TO_CREATE = this.configService.get(
      'general.defaultTaskNumberToCreate',
    );
  }

  async appendTasks(): Promise<void> {
    this.logger.debug('cron started');

    let habitsProcessed = 0;

    let habitsChunk = await this.getHabitWithStats();

    while (habitsChunk.length) {
      await Promise.all(
        habitsChunk.map(habit => this.addNewTasksToHabit(habit)),
      );

      habitsChunk = await this.getHabitWithStats();
      habitsProcessed += habitsChunk.length;

      this.logger.debug(`processed ${habitsProcessed} habits`);
      await sleep(this.PAUSE_BETWEEN_CHUNKS);
    }

    this.logger.debug('cron finished');
  }

  private async getHabitWithStats() {
    return this.habitsRepository.getHabitsWithStats(
      this.HABITS_CHUNK_QTY,
      this.DEFAULT_TASKS_NUMBER_TO_CREATE,
    );
  }

  async addNewTasksToHabit(habit: HabitStats): Promise<void> {
    const durationBetweenTasks = this.tasksService.getDurationBetweenTasks(
      habit,
    );
    let baseDate = moment(habit.maxTaskDate).add(durationBetweenTasks);

    if (moment() > baseDate) {
      baseDate = moment();
    }

    await this.tasksRepository.save(
      this.tasksService.composeTasksForHabit(habit, habit.tasksToAdd, baseDate),
    );
  }
}
