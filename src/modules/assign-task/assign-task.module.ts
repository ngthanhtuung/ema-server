import { Module } from '@nestjs/common';
import { AssignTaskController } from './assign-task.controller';
import { AssignTaskService } from './assign-task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignTaskEntity } from './assign-task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssignTaskEntity])],
  controllers: [AssignTaskController],
  providers: [AssignTaskService],
  exports: [AssignTaskService],
})
export class AssignTaskModule {}
