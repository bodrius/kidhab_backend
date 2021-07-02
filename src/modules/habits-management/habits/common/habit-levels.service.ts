import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HabitEntity } from './habit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HabitsRepository } from './habits.repository';
import { HabitsStatuses } from './habits-statuses.enum';
import { PushNotificationsService } from '@src/modules/push-notifications/push-notifications.service';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { ChildrenService } from '@src/modules/children/common/children.service';

interface HabitLevelConfig {
  levelTasksPercentage: number;
  defaultLevelTasksCount: number;
}

@Injectable()
export class HabitLevelsService {
  constructor(
    @InjectRepository(HabitsRepository)
    private habitsRepository: HabitsRepository,
    private pushNotificationsService: PushNotificationsService,
    private childrenService: ChildrenService,
    private configService: ConfigService,
  ) {}

  async incrementHabitLevel(
    habit: HabitEntity,
    child: ChildEntity,
  ): Promise<HabitEntity> {
    if (!habit || habit.timesToCompleteLevel === null) {
      return;
    }

    const newTimesToCompleteLevelLeft = habit.timesToCompleteLevelLeft - 1;
    const isAllHabitTasksFinished = !(habit.timesToCompleteLeft - 1);
    const isHabitLevelFinished =
      !habit.timesToCompleteLevelLeft || !newTimesToCompleteLevelLeft;

    if (isAllHabitTasksFinished) {
      const completedHabit = await this.markHabitCompleted(habit);
      await this.pushNotificationsService.sendHabitCompleted(habit, child);
      return completedHabit;
    }
    if (isHabitLevelFinished) {
      const updatedHabit = await this.assignNewHabitLevel(habit);
      await this.pushNotificationsService.sendHabitLevelChange(habit, child);

      return updatedHabit;
    }

    return this.habitsRepository.updateHabit(habit, {
      timesToCompleteLevelLeft: newTimesToCompleteLevelLeft,
      timesToCompleteLeft: habit.timesToCompleteLeft - 1,
    });
  }

  async resetHabitLevelProgress(habit: HabitEntity): Promise<HabitEntity> {
    const res = await this.habitsRepository
      .createQueryBuilder('h')
      .update(HabitEntity)
      .set({
        timesToCompleteLevelLeft: () => '"timesToCompleteLevel"',
        timesToCompleteLeft: () =>
          '"timesToCompleteLeft" + ("timesToCompleteLevel" - "timesToCompleteLevelLeft")',
        levelStreakBroken: true,
      })
      .where({ id: habit.id })
      .returning('*')
      .execute();

    return res.raw[0] as HabitEntity;
  }

  async assignFirstLevel(habit: HabitEntity): Promise<HabitEntity> {
    const levelConfig = this.getLevelConfig(1);
    const timesToCompleteLevel = this.getTimesToCompleteForLevel(
      habit.timesToComplete,
      levelConfig,
    );

    return this.habitsRepository.updateHabit(habit, {
      habitLevel: 1,
      timesToCompleteLevel,
      timesToCompleteLevelLeft: timesToCompleteLevel,
    });
  }

  private markHabitCompleted(habit: HabitEntity) {
    return this.habitsRepository.updateHabit(habit, {
      status: HabitsStatuses.COMPLETED,
      timesToCompleteLeft: 0,
      timesToCompleteLevelLeft: 0,
    });
  }

  private async assignNewHabitLevel(habit: HabitEntity): Promise<HabitEntity> {
    const newLevel = habit.habitLevel + 1;
    let timesToCompleteLevel: number;

    const levelConfig = this.getLevelConfig(newLevel);

    if (!levelConfig && newLevel === 3) {
      timesToCompleteLevel =
        habit.timesToCompleteLeft && habit.timesToCompleteLeft - 1;
    } else if (!levelConfig) {
      return habit;
    } else {
      timesToCompleteLevel = this.getTimesToCompleteForLevel(
        habit.timesToComplete,
        levelConfig,
      );
    }

    if (!habit.levelStreakBroken) {
      const bonusPointsForStreak =
        habit.pointsRate * habit.timesToCompleteLevel;
      await this.childrenService.incrementBalance(
        habit.childId,
        bonusPointsForStreak,
      );
    }

    const pointsBoostPercentage = this.configService.get(
      'general.habitLevels.pointsBoostForLevelUpPercentage',
    );
    const pointsRateIncrease = _.round(
      (habit.points * pointsBoostPercentage) / 100,
    );

    return this.habitsRepository.updateHabit(
      habit,
      {
        habitLevel: newLevel,
        timesToCompleteLevel,
        timesToCompleteLevelLeft: timesToCompleteLevel,
        timesToCompleteLeft:
          habit.timesToCompleteLeft && habit.timesToCompleteLeft - 1,
      },
      {
        pointsRate: _.round(habit.pointsRate + pointsRateIncrease),
      },
    );
  }

  private getLevelConfig(newHabitLevel: number): null | HabitLevelConfig {
    let levelConfigParam: string;

    if (newHabitLevel === 1) {
      levelConfigParam = 'first';
    } else if (newHabitLevel === 2) {
      levelConfigParam = 'second';
    } else {
      return;
    }

    return this.configService.get(`general.habitLevels.${levelConfigParam}`);
  }

  private getTimesToCompleteForLevel(
    habitTimesToComplete: number,
    levelConfig: HabitLevelConfig,
  ) {
    const { levelTasksPercentage, defaultLevelTasksCount } = levelConfig;

    return habitTimesToComplete
      ? _.round((habitTimesToComplete * levelTasksPercentage) / 100) || 1
      : defaultLevelTasksCount;
  }
}
