import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ServiceAccount } from 'firebase-admin';
import * as firebaseAdmin from 'firebase-admin';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  const configService = app.get(ConfigService);

  const port: number = configService.get('PORT');
  const pathOpenApi: string = configService.get('PATH_OPEN_API');
  const server_host: string = configService.get('SERVER_HOST');
  const environment: string = configService.get('ENVIRONMENT');
  app.setGlobalPrefix(pathOpenApi);

  // setup CORS
  app.enableCors({
    credentials: true,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    origin: '*',
    exposedHeaders: ['Set-Cookie'],
  });
  // end setup CORS

  // setup swagger
  if (environment === 'dev') {
    const config = new DocumentBuilder()
      .setTitle('Human Resource for The Event Organizer System')
      .setDescription(
        'The Human Resource for The Event Organizer System API description',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(pathOpenApi, app, document);
  }

  // end seup swagger

  //setup firebase
  const firebaseConfig: ServiceAccount = {
    projectId: configService.get('PROJECT_ID'),
    privateKey: configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      .replace(/\\n/g, '\n'),
    clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
  };

  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(firebaseConfig),
    storageBucket: configService.get<string>('FIREBASE_STORAGE_BUCKET'),
  });

  //end set up firebase

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port, () => {
    console.info(`Server is running at ${server_host}:${port}/${pathOpenApi}`);
  });
}
bootstrap();
