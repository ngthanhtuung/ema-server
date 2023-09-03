import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose'],
    cors: true
  })

  const configService = app.get(ConfigService)

  const port: number = configService.get('PORT');
  const pathOpenApi: string = configService.get('PATH_OPEN_API');
  const server_host: string = configService.get('SERVER_HOST');
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
  const config = new DocumentBuilder()
    .setTitle('Human Resource for The Event Organizer System')
    .setDescription('The Human Resource for The Event Organizer System API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(pathOpenApi, app, document);
  // end seup swagger

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running at ${server_host}:${port}/${pathOpenApi}`);
  });

}
bootstrap();
