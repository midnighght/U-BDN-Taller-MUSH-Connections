import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const port = process.env.PORT || 3000;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
  const maxFileSize = process.env.MAX_FILE_SIZE || '50mb';
  
  app.use(json({ limit: maxFileSize }));
  app.use(urlencoded({ limit: maxFileSize, extended: true }));
  app.enableCors({
    origin: frontendUrl, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });
  
  await app.listen(port);
  console.log(`🚀 Backend ejecutándose en: http://localhost:${port}`);
  console.log(`🔗 CORS habilitado para: ${frontendUrl}`);
}
bootstrap().catch(err => {
  console.error('Error starting application:', err);
  process.exit(1);
});