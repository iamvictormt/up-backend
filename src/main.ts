import { Handler, Context, Callback } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import serverlessExpress from '@vendia/serverless-express';

let server: Handler;

async function bootstrap() {
  const expressApp = express();

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      'https://up-landing-page.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.init();

  server = serverlessExpress({ app: expressApp });
}

export const handler = async (event: any, context: Context, callback: Callback) => {
  if (!server) {
    await bootstrap();
  }
  return server(event, context, callback);
};
