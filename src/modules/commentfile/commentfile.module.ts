import { Module } from '@nestjs/common';
import { CommentfileService } from './commentfile.service';
import { CommentfileController } from './commentfile.controller';

@Module({
  controllers: [CommentfileController],
  providers: [CommentfileService],
})
export class CommentfileModule {}
