import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

import * as Joi from '@hapi/joi';
import { RoleModule } from './main/role/role.module';
import { AutoMapperModule } from './automapper/automapper.module';

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
    RoleModule,
    AutoMapperModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
