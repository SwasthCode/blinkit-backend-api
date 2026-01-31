import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import * as os from 'os';

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
    .setTitle('Blinkt API')
    .setDescription('The Blinkt API description')
    .setVersion('1.0')
    // .addTag('api')
    .addBearerAuth(
      { type: 'http', name: 'token', in: 'header' },
      'authentication',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.js',
    ],
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
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
    const localIp = getLocalIp();
    app.listen(port, () => {
      console.log(`Application is running on: http://localhost:${port}`);
      if (localIp !== 'localhost') {
        console.log(`Application is running on: http://${localIp}:${port}`);
      }
      console.log(`Swagger documentation: http://localhost:${port}/api`);
      if (localIp !== 'localhost') {
        console.log(`Swagger documentation: http://${localIp}:${port}/api`);
      }
    });
  }
  void bootstrap();
}
