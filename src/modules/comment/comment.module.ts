import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommentEntity } from './comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskModule } from '../task/task.module';
import { CommentfileModule } from '../commentfile/commentfile.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity]),
    TaskModule,
    CommentfileModule,
    NotificationModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
