import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { json, urlencoded, raw } from 'express';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/api/webhook/stripe', raw({ type: 'application/json' }));
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      'https://sistema.upconnection.app',
      'up-admin-connection-vercel.app',
      //'https://up-sistema-admin.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3002);
}

bootstrap();
