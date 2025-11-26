
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.enableCors({
    origin: 'http://localhost:5174', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });
  
  await app.listen(3000);
  console.log('🚀 Backend ejecutándose en: http://localhost:3000');
  console.log('🔗 CORS habilitado para: http://localhost:5174');
}
bootstrap();