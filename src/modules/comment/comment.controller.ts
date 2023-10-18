import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentCreateRequest } from './dto/comment.request';
import { GetUser } from 'src/decorators/getUser.decorator';
import { CommentEntity } from './comment.entity';

@Controller('comment')
@ApiTags('Comment')
@ApiBearerAuth()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('/:taskId')
  async getComment(@Param('taskId') taskId: string): Promise<CommentEntity[]> {
    return await this.commentService.getCommentByTaskId(taskId);
  }

  @Post()
  async createComment(
    @Body() comment: CommentCreateRequest,
    @GetUser() user: string,
  ): Promise<string | undefined> {
    return await this.commentService.createComment(comment, user);
  }

  @Delete('/:commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @GetUser() user: string,
  ): Promise<string | undefined> {
    return await this.commentService.deleteComment(commentId, user);
  }
}
