import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { ProfileModule } from 'src/modules/profile/profile.module';
import { UserModule } from 'src/modules/user/user.module';
import { AuthenticationModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/config/jwt.config';
import { SharedModule } from 'src/shared/shared.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { AllExceptionsFilter } from 'src/exception/catch-all-http.exception';
import { LoggerMiddleware } from 'src/middleware/logger.middleware';
import { TransformInterceptor } from 'src/middleware/transform.interceptor';
import { DivisionModule } from './modules/division/division.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validationSchema: Joi.object({
        MYSQL_PORT: Joi.number().required(),
        PORT: Joi.number(),
      }),
    }),
    DatabaseModule,
    SharedModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.accessTokenSecret,
      signOptions: { expiresIn: '1d' },
    }),
    AuthenticationModule,
    ProfileModule,
    UserModule,
    DivisionModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
