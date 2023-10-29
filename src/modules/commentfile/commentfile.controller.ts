import { Body, Controller, Param, Put } from '@nestjs/common';
import { CommentfileService } from './commentfile.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CommentFileRequest } from './dto/commentFile.request';

@Controller('commentfile')
@ApiTags('Comment File')
@ApiBearerAuth()
export class CommentfileController {
  constructor(private readonly commentfileService: CommentfileService) {}

  @Put('/:commentId')
  @ApiBody({
    type: [CommentFileRequest],
  })
  async updateCommentFile(
    @Param('commentId') commentId: string,
    @Body() req: CommentFileRequest[],
  ): Promise<string> {
    return this.commentfileService.updateCommentFile(commentId, req);
  }
}
