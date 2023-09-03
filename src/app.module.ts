import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { RoleModule } from './main/role/role.module';
import { AutoMapperModule } from './automapper/automapper.module';
import { UserModule } from './main/user/user.module';
import { DepartmentModule } from './main/department/department.module';
import { SharedModule } from './shared/shared.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './main/auth/auth.module';

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
    AutoMapperModule,
    AuthModule,
    RoleModule,
    UserModule,
    DepartmentModule,
    SharedModule,
    MailModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
