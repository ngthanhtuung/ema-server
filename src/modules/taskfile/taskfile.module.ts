import { Module } from '@nestjs/common';
import { TaskfileService } from './taskfile.service';
import { TaskfileController } from './taskfile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskFileEntity } from './taskfile.entity';
import { TaskModule } from '../task/task.module';
import { forwardRef } from '@nestjs/common/utils';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskFileEntity]),
    forwardRef(() => TaskModule),
  ],
  controllers: [TaskfileController],
  providers: [TaskfileService],
  exports: [TaskfileService],
})
export class TaskfileModule {}
