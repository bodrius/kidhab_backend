import { registerAs } from '@nestjs/config';
import * as convict from 'convict';
import { join } from 'path';
import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';

export const databaseConfig = registerAs('database', () => {
  const convictOpts: convict.Options = {};

  if (process.env.NODE_ENV === 'azure_migrations') {
    convictOpts.env = dotenv.parse(
      readFileSync(join(__dirname, '../../.env.azure')),
    );
  }

  return convict(
    {
      type: {
        doc: 'Database DBMS',
        format: String,
        default: null,
        env: 'DB_TYPE',
      },
      host: {
        doc: 'Database host',
        format: String,
        default: null,
        env: 'DB_HOST',
      },
      port: {
        doc: 'Database port',
        format: Number,
        default: null,
        env: 'DB_PORT',
      },
      username: {
        doc: 'Database user name',
        format: String,
        default: null,
        env: 'DB_USERNAME',
      },
      password: {
        doc: 'Database user password',
        format: String,
        default: null,
        env: 'DB_PASSWORD',
      },
      database: {
        doc: 'Database name',
        format: String,
        default: null,
        env: 'DB_NAME',
      },
      synchronize: {
        doc: 'TypeORM synchronize option',
        format: Boolean,
        default: null,
        env: 'DB_SYNCHRONIZE',
      },
      ssl: {
        format: Boolean,
        default: false,
        env: 'DB_SSL',
      },
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      options: {
        useUTC: true,
      },
    },
    convictOpts,
  )
    .validate()
    .getProperties();
});
