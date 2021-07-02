import { Context } from '@azure/functions';
import { AppendTasksService } from '@src/modules/habits-management/habits/crons/append-tasks/append-tasks.service';
import { createApp } from '../src/main.azure';

export default async function(context: Context): Promise<void> {
  const app = await createApp();

  const appendTasksService = app.get(AppendTasksService);
  try {
    await appendTasksService.appendTasks();
  } finally {
    context.done();
  }
}
