import { Module } from '@nestjs/common';
import { CommentfileService } from './commentfile.service';
import { CommentfileController } from './commentfile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentFileEntity } from './commentfile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommentFileEntity])],
  controllers: [CommentfileController],
  providers: [CommentfileService],
  exports: [CommentfileService],
})
export class CommentfileModule {}
