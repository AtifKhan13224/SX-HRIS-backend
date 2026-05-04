import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  try {
    console.log('🔄 Starting SX-HRIS Backend...');
    console.log('📦 Environment:', process.env.NODE_ENV);
    console.log('🗄️  Database Host:', process.env.DB_HOST);
    console.log('🔧 DB Synchronize:', process.env.DB_SYNCHRONIZE);
    
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });

    console.log('✅ NestJS Application created');

    // Increase body size limits (50MB for JSON, 50MB for urlencoded)
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('SX-HRIS API')
    .setDescription('Advanced HRMS System API Documentation')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Employees', 'Employee management endpoints')
    .addTag('Departments', 'Department management endpoints')
    .addTag('Attendance', 'Attendance tracking endpoints')
    .addTag('Leave', 'Leave management endpoints')
    .addTag('Payroll', 'Payroll management endpoints')
    .addTag('Performance', 'Performance management endpoints')
    .addTag('Recruitment', 'Recruitment management endpoints')
    .addTag('Reports', 'Reporting endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  console.log(`🔌 Attempting to bind to port ${port}...`);
  
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 SX-HRIS Backend running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

bootstrap();
