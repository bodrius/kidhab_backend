import { Context } from '@azure/functions';
import { SetChildCredsReminderService } from '@src/modules/children/crons/set-child-creds-reminder/set-child-creds-reminder.service';
import { createApp } from '../src/main.azure';

export default async function(context: Context): Promise<void> {
  const app = await createApp();

  const setChildCredsReminderService = app.get(SetChildCredsReminderService);
  try {
    await setChildCredsReminderService.sendSetCredsReminders();
  } finally {
    context.done();
  }
}
