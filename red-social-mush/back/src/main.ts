/*import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();*/
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  
  app.enableCors({
    origin: 'http://localhost:5173', // ← La dirección de tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });
  
  await app.listen(3000);
  console.log('🚀 Backend ejecutándose en: http://localhost:3000');
  console.log('🔗 CORS habilitado para: http://localhost:5173');
}
bootstrap();