import { Context } from '@azure/functions';
import { UpdateFamiliesAccountTypeService } from '@src/modules/families/crons/update-families-account-type/update-families-account-type.service';
import { createApp } from '../src/main.azure';

export default async function(context: Context): Promise<void> {
  const app = await createApp();

  const updateFamiliesAccountTypeService = app.get(
    UpdateFamiliesAccountTypeService,
  );
  try {
    await updateFamiliesAccountTypeService.updateFamiliesAccountType();
  } finally {
    context.done();
  }
}
