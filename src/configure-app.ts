import * as helmet from 'helmet';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { initSwagger } from './shared/swagger/swagger.initializer';
import { ConfigService } from '@nestjs/config';

export function configureApp(app: INestApplication): void {
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
    }),
  );
  app.enableCors({ origin: configService.get('general.allowedOrigin') });
  app.use(
    (helmet as any)({
      contentSecurityPolicy: false,
    }),
  );
  app.use((req, res, next) => {
    console.log(
      `url - ${req.url}, method - ${req.method}, body - '${
        typeof req.body === 'object' ? JSON.stringify(req.body) : req.body
      }'`,
    );

    next();
  });
  initSwagger(app);
}
