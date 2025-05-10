import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';

// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Log environment info
  logger.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`Firebase Project ID: ${process.env.FIREBASE_PROJECT_ID ? 'Configured' : 'Missing'}`);
  logger.log(`Google Maps API Key: ${process.env.GOOGLE_MAPS_API_KEY ? 'Configured' : 'Missing'}`);
  
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });
  
  const port = process.env.PORT || 6465;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch(err => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
