import { Injectable, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { CommentService } from 'src/modules/comment/comment.service';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { CommentCreateRequest } from 'src/modules/comment/dto/comment.request';
import { UserService } from 'src/modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { WsGuard } from 'src/guards/ws.guard';
import { SocketEnum } from 'src/common/enum/socket.enum';
import { WebsocketExceptionsFilter } from 'src/exception/ws-exception.filter';
import { PayloadUser } from 'src/modules/user/dto/user.response';
import { jwtConstants } from 'src/config/jwt.config';
import { CommentFileRequest } from 'src/modules/commentfile/dto/commentFile.request';

@Injectable()
@UseFilters(WebsocketExceptionsFilter)
export class CommentGateway extends AppGateway {
  constructor(
    protected readonly jwtService: JwtService,
    private readonly commentService: CommentService,
    protected readonly userService: UserService,
  ) {
    super(jwtService, userService);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('comment')
  async handleComment(
    @MessageBody() comment: IComment,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { taskID, content, file, user } = comment;
    const newComment: CommentCreateRequest = {
      taskID,
      content,
      file,
    };
    await this.commentService.createComment(newComment, JSON.stringify(user));
    const commentInTask = await this.commentService.getCommentByTaskId(taskID);
    client.to(taskID).emit(`comment-${taskID}`, commentInTask);
  }

  //bắn vào một event comment
  //comment bao gồm: text, taskId
  //lưu vào db cái comment
  //emit lại danh sách comment của task đó sort theo desc createdAt
}

export interface IComment {
  taskID: string;
  content: string;
  file?: CommentFileRequest[];
  user: PayloadUser;
}
