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
import { EventModule } from './modules/event/event.module';
import { AssignEventModule } from './modules/assign-event/assign-event.module';
import { TaskModule } from './modules/task/task.module';
import { AssignTaskModule } from './modules/assign-task/assign-task.module';
// import { TaskfileModule } from './modules/taskfile/taskFile.module';
import { FileModule } from './file/file.module';
import { FirebaseProviderModule } from './providers/firebase/provider.module';
import { NotificationModule } from './modules/notification/notification.module';
import { GatewayModule } from './sockets/gateway.module';
import { CommentModule } from './modules/comment/comment.module';
import { DeviceModule } from './modules/device/device.module';
import { BudgetModule } from './modules/budget/budget.module';
import { CommentfileModule } from './modules/commentfile/commentfile.module';
import { RequestModule } from './modules/request/request.module';
import { TimesheetModule } from './modules/timesheet/timesheet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./.env'],
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
    DivisionModule,
    EventModule,
    AssignEventModule,
    TaskModule,
    AssignTaskModule,
    FileModule,
    DeviceModule,
    FirebaseProviderModule,
    NotificationModule,
    GatewayModule,
    CommentModule,
    CommentfileModule,
    BudgetModule,
    RequestModule,
    TimesheetModule,
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
