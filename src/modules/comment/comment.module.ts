import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommentEntity } from './comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity]),
    TaskModule
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
