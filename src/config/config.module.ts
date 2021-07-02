import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './database.config';
import { encryptConfig } from './encrypt.config';
import { apiConfig } from './api.config';
import { generalConfig } from './general.config';
import { googleOAuthConfig } from './google-oauth.config';
import { join } from 'path';
import { appleInAppPurchasesConfig } from './apple-in-app-purchases.config';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath:
    process.env.NODE_ENV === 'azure'
      ? join(process.cwd(), '.env.azure')
      : join(process.cwd(), '.env'),
  load: [
    generalConfig,
    databaseConfig,
    encryptConfig,
    apiConfig,
    googleOAuthConfig,
    appleInAppPurchasesConfig,
  ],
});
