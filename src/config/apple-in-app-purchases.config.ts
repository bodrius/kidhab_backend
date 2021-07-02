import { registerAs } from '@nestjs/config';
import * as convict from 'convict';

export const appleInAppPurchasesConfig = registerAs(
  'appleInAppPurchases',
  () => {
    return convict({
      prodBaseURL: {
        doc: 'Base URL for Apple In-App Purchases (PROD)',
        format: String,
        default: 'https://buy.itunes.apple.com',
      },
      sandboxBaseURL: {
        doc: 'Base URL for Apple In-App Purchases (Sandbox)',
        format: String,
        default: 'https://sandbox.itunes.apple.com',
      },
      password: {
        doc: 'Password (secret) for Apple In-App Purchases',
        format: String,
        default: null,
        env: 'APPLE_IN_APP_PURCHASES_PASSWORD',
      },
    })
      .validate()
      .getProperties();
  },
);
