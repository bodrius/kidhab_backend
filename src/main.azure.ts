import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppBaseModule } from './app-base.module';
import { configureApp } from './configure-app';

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppBaseModule);
  configureApp(app);

  await app.init();
  return app;
}
