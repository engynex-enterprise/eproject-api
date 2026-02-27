import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3001;
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api';
  const corsOrigins = configService.get<string[]>('app.corsOrigins') || [
    'http://localhost:3000',
  ];

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Org-Id'],
  });

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('eProject API')
    .setDescription('Project management platform API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Organizations', 'Organization management')
    .addTag('Projects', 'Project management')
    .addTag('Issues', 'Issue tracking')
    .addTag('Sprints', 'Sprint management')
    .addTag('Boards', 'Board views')
    .addTag('Workflows', 'Workflow management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);
  console.log(`eProject API is running on: http://localhost:${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/docs`);
}
bootstrap();
