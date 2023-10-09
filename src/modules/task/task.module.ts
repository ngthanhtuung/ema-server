import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { forwardRef } from '@nestjs/common/utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity';
// import { EventModule } from '../event/event.module';
import { TaskfileModule } from '../taskfile/taskFile.module';
import { AssignTaskModule } from '../assign-task/assign-task.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskEntity]),
    forwardRef(() => TaskfileModule),
    AssignTaskModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
