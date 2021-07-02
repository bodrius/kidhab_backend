import { registerAs } from '@nestjs/config';
import * as convict from 'convict';

export const googleOAuthConfig = registerAs('googleOAuth', () => {
  return convict({
    clientID: {
      doc: 'Google OAuth API Client Id',
      format: String,
      default: null,
      env: 'GOOGLE_OAUTH_CLIENT_ID',
    },
    clientSecret: {
      doc: 'Google OAuth API Client Secret',
      format: String,
      default: null,
      env: 'GOOGLE_OAUTH_CLIENT_SECRET',
    },
    callbackUrl: {
      doc: 'Google OAuth API Callback URL',
      format: String,
      default: null,
      env: 'GOOGLE_OAUTH_CALLBACK_URL',
    },
  })
    .validate()
    .getProperties();
});
