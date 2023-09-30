import { Module } from '@nestjs/common';
import { databaseConnection } from './database-connection';

@Module({
  imports: [...databaseConnection],
  exports: [...databaseConnection],
})
export class DatabaseModule {}
