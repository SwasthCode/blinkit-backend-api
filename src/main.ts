import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedApp: express.Express;

async function createApp(): Promise<express.Express> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Base API')
    .setDescription('The Base API description')
    .setVersion('1.0')
    .addTag('api')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

// For Vercel serverless functions
export default async function handler(
  req: express.Request,
  res: express.Response,
) {
  const app = await createApp();
  app(req, res);
}

// For local development
if (require.main === module) {
  async function bootstrap() {
    console.log('🚀 Starting application...');
    const app = await createApp();
    const port = process.env.PORT ?? 8000;
    app.listen(port, () => {
      console.log(`Application is running on: http://localhost:${port}`);
      console.log(`Swagger documentation: http://localhost:${port}/api`);
    });
  }
  void bootstrap();
}
