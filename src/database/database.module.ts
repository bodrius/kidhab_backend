import * as pg from 'pg';
import * as pgInterval from 'postgres-interval';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

setParsers();

export const databaseModule = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    ...configService.get('database'),
  }),
});

function setParsers() {
  pg.types.setTypeParser(pg.types.builtins.INTERVAL, value =>
    pgInterval(value).toPostgres(),
  );
}
