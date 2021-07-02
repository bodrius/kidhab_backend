import { registerAs } from '@nestjs/config';
import * as convict from 'convict';

export const apiConfig = registerAs('api', () => {
  return convict({
    port: {
      doc: 'Port to listen',
      format: Number,
      default: null,
      env: 'PORT',
    },
  })
    .validate()
    .getProperties();
});
