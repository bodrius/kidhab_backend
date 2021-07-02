import { EntityRepository, Repository } from 'typeorm';
import { TaskEntity } from './task.entity';

@EntityRepository(TaskEntity)
export class TasksRepository extends Repository<TaskEntity> {
  async deleteLastTasksForHabit(
    habitId: string,
    tasksToDeleteCount: number,
  ): Promise<void> {
    await this.query(
      `
      DELETE FROM tasks AS t1
      WHERE id IN (
        SELECT id FROM tasks AS t2
        WHERE t2."habitId" = $1
        ORDER BY t2.date DESC
        LIMIT $2
      );
    `,
      [habitId, tasksToDeleteCount],
    );
  }
}
