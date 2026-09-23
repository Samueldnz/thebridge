import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 3000;
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || '*';
  const defaultOrigins = [
    'https://thebridge.app.br',
    'https://www.thebridge.app.br',
    'https://api.thebridge.app.br',
    'https://darkviolet-baboon-478084.hostingersite.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];
  const allowedOrigins = corsOrigin.includes(',')
    ? corsOrigin.split(',').map((o) => o.trim())
    : corsOrigin === '*'
      ? defaultOrigins
      : Array.from(new Set([corsOrigin, ...defaultOrigins]));

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  await app.listen(port);
}

void bootstrap();