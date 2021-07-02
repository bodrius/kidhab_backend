import { Context } from '@azure/functions';
import { MarkOverdueService } from '@src/modules/habits-management/habits/crons/mark-overdue/mark-overdue.service';
import { createApp } from '../src/main.azure';

export default async function(context: Context): Promise<void> {
  const app = await createApp();

  const markOverdueService = app.get(MarkOverdueService);
  try {
    await markOverdueService.updateHabitsAndTasks();
  } finally {
    context.done();
  }
}
