import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { configureApp } from './configure-app';

// TODO: add receipt data to payments
// TODO: make familyId optional
// TODO: make familyId + transactionId unique
// TODO: accept only webhook info about specific apple connect env (Production/Sandbox)

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  configureApp(app);

  await app.listen(configService.get<number>('api.port'));
}
bootstrap();
