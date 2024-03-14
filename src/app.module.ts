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
import { FileModule } from './file/file.module';
import { FirebaseProviderModule } from './providers/firebase/provider.module';
import { NotificationModule } from './modules/notification/notification.module';
import { CommentModule } from './modules/comment/comment.module';
import { DeviceModule } from './modules/device/device.module';
import { CommentfileModule } from './modules/commentfile/commentfile.module';
import { StatisticModule } from './modules/statistic/statistic.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RolesModule } from './modules/roles/roles.module';
import { UserNotificationsModule } from './modules/user_notifications/user_notifications.module';
import { SettingsModule } from './modules/settings/settings.module';
import { CustomerContactsModule } from './modules/customer_contacts/customer_contacts.module';
import { EventTypesModule } from './modules/event_types/event_types.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { GatewayModule } from './sockets/gateway.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { GroupsModule } from './modules/groups/groups.module';
import { GroupsMessagesModule } from './modules/groups_messages/groups_messages.module';
import { GroupsMessagesAttachmentsModule } from './modules/groups_messages_attachments/groups_messages_attachments.module';
import { MessagesAttachmentsModule } from './modules/messages_attachments/messages_attachments.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MapModule } from './modules/map/map.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ItemsModule } from './modules/items/items.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    SharedModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.accessTokenSecret,
      signOptions: { expiresIn: '1d' },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Path to your public directory
      exclude: ['/api*'],
    }),
    AuthenticationModule,
    SettingsModule,
    CustomerContactsModule,
    UserModule,
    ProfileModule,
    RolesModule,
    DivisionModule,
    EventTypesModule,
    EventModule,
    ContractsModule,
    AssignEventModule,
    ItemsModule,
    TaskModule,
    AssignTaskModule,
    FileModule,
    DeviceModule,
    FirebaseProviderModule,
    NotificationModule,
    GatewayModule,
    CommentModule,
    CommentfileModule,
    StatisticModule,
    RolesModule,
    UserNotificationsModule,
    SharedModule,
    MessagesModule,
    ConversationsModule,
    GroupsModule,
    GroupsMessagesModule,
    GroupsMessagesAttachmentsModule,
    MessagesAttachmentsModule,
    MapModule,
    CategoriesModule,
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
