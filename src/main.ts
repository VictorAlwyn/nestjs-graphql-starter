import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { default as compression } from 'compression';
import { default as helmet } from 'helmet';

import { AppModule } from './app.module';
import { GraphQLExceptionFilter } from './core/filters/graphql-exception.filter';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { ValidationExceptionFilter } from './core/filters/validation-exception.filter';
import { AppLoggerService } from './core/logger/logger.service';

/**
 * Production-ready application bootstrap with comprehensive configuration
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  try {
    // Create NestJS application with enhanced configuration
    const app = await NestFactory.create(AppModule, {
      logger: new AppLoggerService('NestApplication'),
      bufferLogs: true,
    });

    // Get configuration service
    const configService = app.get(ConfigService);
    const port = configService.get<number>('port', 3000);
    const env = configService.get<string>('env', 'development');
    const appName = configService.get<string>(
      'appName',
      'NestJS GraphQL Starter',
    );
    const appVersion = configService.get<string>('appVersion', '1.0.0');

    // Enable shutdown hooks for graceful shutdown
    app.enableShutdownHooks();

    // Security middleware
    if (configService.get<boolean>('HELMET_ENABLED', true)) {
      app.use(
        helmet({
          contentSecurityPolicy: env === 'production' ? undefined : false,
          crossOriginEmbedderPolicy: false,
        }),
      );
    }

    // Compression middleware
    if (configService.get<boolean>('compression.enabled', true)) {
      app.use(
        compression({
          level: configService.get<number>('compression.level', 6),
          threshold: 1024,
        }),
      );
    }

    // CORS configuration
    const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS', '*');
    app.enableCors({
      origin: allowedOrigins === '*' ? true : allowedOrigins.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-API-Key',
        'X-Correlation-ID',
      ],
    });

    // Global validation pipe with comprehensive configuration
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Strip properties that don't have decorators
        forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
        transform: true, // Automatically transform payloads to DTO instances
        transformOptions: {
          enableImplicitConversion: true, // Allow implicit type conversion
        },
        disableErrorMessages: env === 'production', // Hide detailed validation errors in production
        validationError: {
          target: false, // Don't expose the target object in validation errors
          value: false, // Don't expose the value in validation errors
        },
      }),
    );

    // Global exception filters (order matters - most specific first)
    app.useGlobalFilters(
      new ValidationExceptionFilter(),
      new HttpExceptionFilter(),
      new GraphQLExceptionFilter(),
    );

    // API versioning
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'api/v',
    });

    // Swagger/OpenAPI documentation (only in development)
    if (
      configService.get<boolean>('swagger.enabled', true) &&
      env !== 'production'
    ) {
      const swaggerPath = configService.get<string>('swagger.path', 'api/docs');
      const config = new DocumentBuilder()
        .setTitle(appName)
        .setDescription(`${appName} API Documentation`)
        .setVersion(appVersion)
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
          },
          'JWT-auth',
        )
        .addApiKey(
          {
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header',
            description: 'API Key for external services',
          },
          'API-Key',
        )
        .addServer(`http://localhost:${port}`, 'Development server')
        .addTag('Authentication', 'Authentication and authorization endpoints')
        .addTag('Users', 'User management endpoints')
        .addTag('Health', 'Health check endpoints')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup(swaggerPath, app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
        },
        customSiteTitle: `${appName} API Documentation`,
      });

      logger.log(
        `📚 Swagger documentation available at: http://localhost:${port}/${swaggerPath}`,
      );
    }

    // Server timeout configuration
    const server = await app.listen(port);
    server.keepAliveTimeout = configService.get<number>(
      'server.keepAliveTimeout',
      5000,
    );
    server.headersTimeout = configService.get<number>(
      'server.headersTimeout',
      60000,
    );

    // Log application startup information
    logger.log(`🚀 Application "${appName}" v${appVersion} is running!`);
    logger.log(`🌍 Environment: ${env}`);
    logger.log(`🔗 GraphQL Playground: http://localhost:${port}/graphql`);
    logger.log(`🏥 Health Check: http://localhost:${port}/health`);
    logger.log(`📊 Metrics: http://localhost:${port}/metrics`);

    if (env === 'development') {
      logger.log(`🔧 Development mode enabled`);
    }

    // Graceful shutdown handling
    process.on('SIGTERM', async () => {
      logger.log('🛑 SIGTERM received, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('🛑 SIGINT received, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Unhandled Promise Rejection:', reason);
  logger.error('Promise:', promise);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the application
bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to bootstrap application:', error);
  process.exit(1);
});
