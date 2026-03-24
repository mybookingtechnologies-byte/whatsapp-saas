import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RolesGuard } from './common/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { SanitizeMiddleware } from './common/middleware/sanitize.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new RolesGuard(reflector));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.use(LoggerMiddleware);
  app.use(SecurityMiddleware);
  app.use(SanitizeMiddleware);
  app.enableCors();
  await app.listen(3001);
}
bootstrap();
