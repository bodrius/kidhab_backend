import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  HealthCheck,
  HealthCheckResult,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Connection } from 'typeorm';

@Controller('health')
@ApiTags('health')
export class HealthController {
  constructor(
    private configService: ConfigService,
    private healthService: HealthCheckService,
    private typeormIndicator: TypeOrmHealthIndicator,
    private dbConnection: Connection,
  ) {}

  @Get('database')
  @HealthCheck()
  checkDatabase(): Promise<HealthCheckResult> {
    return this.healthService.check([
      (): Promise<HealthIndicatorResult> =>
        this.typeormIndicator.pingCheck(
          this.configService.get('database.database'),
          { timeout: 3000, connection: this.dbConnection },
        ),
    ]);
  }

  @Get('uptime')
  checkUptime(): any {
    return {
      uptime: Math.floor(process.uptime()),
      units: 'seconds',
    };
  }
}
