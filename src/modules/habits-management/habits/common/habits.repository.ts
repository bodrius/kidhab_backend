import * as _ from 'lodash';
import {
  EntityRepository,
  Repository,
  FindConditions,
  FindOneOptions,
  Not,
  DeepPartial,
} from 'typeorm';
import { HabitEntity } from './habit.entity';
import { HabitsStatuses } from './habits-statuses.enum';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { TaskStatuses } from '../../tasks/common/task-statuses.enum';

export interface HabitAndTaskIds extends HabitEntity {
  taskIds: string[];
}

export interface HabitStats extends HabitEntity {
  tasksToAdd: number;
  maxTaskDate: Date;
}

@EntityRepository(HabitEntity)
export class HabitsRepository extends Repository<HabitEntity> {
  async findHabit(
    criterias: FindConditions<HabitEntity>,
    options: FindOneOptions<HabitEntity> = {},
  ): Promise<HabitEntity> {
    return this.findOne({
      where: { ...criterias, status: Not(HabitsStatuses.DELETED) },
      ...options,
    });
  }

  async findHabitsForChild(
    child: ChildEntity,
    relations: string[] = [],
  ): Promise<HabitEntity[]> {
    return this.find({
      where: { child, status: Not(HabitsStatuses.DELETED) },
      relations,
    });
  }

  async countHabitsWithExpiredTasks(): Promise<number> {
    return this.createQueryBuilder('habit')
      .innerJoinAndSelect('habit.tasks', 'task')
      .andWhere('habit.status = :habitStatus', {
        habitStatus: HabitsStatuses.IN_PROGRESS,
      })
      .andWhere("task.date <= now()::date - interval '1 day'")
      .andWhere('task.status = :taskStatus', {
        taskStatus: TaskStatuses.CREATED,
      })
      .getCount();
  }

  async getHabitsWithExpiredTasksChunk(
    take: number,
  ): Promise<HabitAndTaskIds[]> {
    return this.createQueryBuilder('h')
      .innerJoin(
        'tasks',
        't',
        "t.date <= now()::date - interval '1 day' AND t.status = :taskStatus",
        { taskStatus: TaskStatuses.CREATED },
      )
      .select(['h.*', 'json_agg(t.id) AS "taskIds"'])
      .where('h.status = :habitStatus', {
        habitStatus: HabitsStatuses.IN_PROGRESS,
      })
      .groupBy('h.id')
      .limit(take)
      .getRawMany();
  }

  async getHabitsWithStats(
    take: number,
    defaultTasksNumberToCreate: number,
  ): Promise<HabitStats[]> {
    return this.createQueryBuilder('h')
      .innerJoin('tasks', 't', 't."habitId" = h.id')
      .select([
        'h.*',
        `CASE
            WHEN h."timesToComplete" IS NULL THEN ${defaultTasksNumberToCreate} - COUNT(*)
            ELSE h."timesToCompleteLeft" - COUNT(*)
          END AS "tasksToAdd"
        `,
        'MAX(t.date) AS maxTaskDate',
      ])
      .where(
        `
          t.status IN (
            '${TaskStatuses.CREATED}',
            '${TaskStatuses.PENDING_APPROVAL}'
          )
        `,
      )
      .groupBy('h.id')
      .having('COUNT(*) < h."timesToCompleteLeft"')
      .orHaving(
        `h."timesToComplete" IS NULL AND COUNT(*) < ${defaultTasksNumberToCreate}`,
      )
      .limit(take)
      .getRawMany();
  }

  async getHabitWithStats(habitId: string): Promise<HabitStats> {
    const [habit] = await this.createQueryBuilder('h')
      .innerJoin('tasks', 't', 't."habitId" = h.id')
      .select([
        'h.*',
        `h."timesToCompleteLeft" - COUNT(*) AS "tasksToAdd"`,
        'MAX(t.date) AS "maxTaskDate"',
      ])
      .where(
        `
          t.status IN (
            '${TaskStatuses.CREATED}',
            '${TaskStatuses.PENDING_APPROVAL}'
          )
          AND h.id = :habitId
        `,
        { habitId },
      )
      .groupBy('h.id')
      .getRawMany();

    return habit;
  }

  async updateHabit(
    habit: HabitEntity,
    params: DeepPartial<HabitEntity>,
    optionalParams: DeepPartial<HabitEntity> = {},
  ): Promise<HabitEntity> {
    const updatedHabit = this.merge(new HabitEntity(), habit, {
      ..._.omit(params, 'categoryId'),
      category: { id: params.categoryId || habit.categoryId },
      pointsRate:
        optionalParams.pointsRate || params.points || habit.pointsRate,
      child: { id: params.childId || habit.childId },
    });

    return this.save(updatedHabit);
  }
}
