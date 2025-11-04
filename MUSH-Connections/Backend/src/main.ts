/*import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();*/
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // frontend origin from env
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(+port);
  console.log(`🚀 Backend ejecutándose en: http://localhost:${port}`);
  console.log(`🔗 CORS habilitado para: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
}
bootstrap();