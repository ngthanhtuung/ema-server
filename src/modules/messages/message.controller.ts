/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Routes, Services } from 'src/utils/constants';
import { IMessageService } from './interface/message';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Put,
  Post,
  // UploadedFiles,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
// import {
//   FileFieldsInterceptor,
//   FilesInterceptor,
// } from '@nestjs/platform-express';
// import { Attachment } from 'src/utils/types';
import { UserEntity } from '../user/user.entity';
import { SkipThrottle } from '@nestjs/throttler';
import { CreateMessageDto } from './dtos/CreateMessage.dto';
import { EditMessageDto } from './dtos/EditMessage.dto';
import { MessageEntity } from './messages.entity';
import { GetUser } from 'src/decorators/getUser.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MessagesPagination } from './dtos/messages.pagination';
@Controller(Routes.MESSAGES)
@ApiTags('Message')
@ApiBearerAuth()
export class MessageController {
  constructor(
    @Inject(Services.MESSAGES) private readonly messageService: IMessageService,
    private eventEmitter: EventEmitter2,
  ) {}

  // @UseInterceptors(
  //   FileFieldsInterceptor([
  //     {
  //       name: 'attachments',
  //       maxCount: 5,
  //     },
  //   ]),
  // )
  @Post()
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       files: {
  //         type: 'array',
  //         items: {
  //           type: 'string',
  //           format: 'binary',
  //         },
  //       },
  //     },
  //   },
  // })
  // @UseInterceptors(FilesInterceptor('files'))
  async createMessage(
    @GetUser() user: string,
    // @UploadedFiles() { attachments }: { attachments: Attachment[] },
    @Param('id') id: string,
    @Body()
    { content }: CreateMessageDto,
  ) {
    // if (!attachments && !content) throw new EmptyMessageException();
    if (!content)
      throw new BadRequestException(
        'Message must contain content or at least 1 attachment',
      );
    // const params = { user, id, content, attachments };
    const params = { user: JSON.parse(user), id, content };
    const response = await this.messageService.createMessage(params);
    this.eventEmitter.emit('message.create', response);
    return 'Created message successfully!!!';
  }

  @Get()
  @SkipThrottle()
  async getMessagesFromConversation(
    @Param('id') id: string,
    @Query() messagesPagination: MessagesPagination,
  ) {
    const messages = await this.messageService.getMessages(
      id,
      messagesPagination,
    );
    return { id, messages };
  }

  @Delete(':messageId')
  async deleteMessageFromConversation(
    @GetUser() user: UserEntity,
    @Param('id', ParseIntPipe) conversationId: string,
    @Param('messageId', ParseIntPipe) messageId: string,
  ) {
    const params = { userId: user.id, conversationId, messageId };
    await this.messageService.deleteMessage(params);
    this.eventEmitter.emit('message.delete', params);
    return { conversationId, messageId };
  }
  // api/conversations/:conversationId/messages/:messageId
  @Put(':messageId')
  async editMessage(
    @GetUser() { id: userId }: UserEntity,
    @Param('id') conversationId: string,
    @Param('messageId') messageId: string,
    @Body() { content }: EditMessageDto,
  ): Promise<MessageEntity> {
    const params = { userId, content, conversationId, messageId };
    const message = await this.messageService.editMessage(params);
    this.eventEmitter.emit('message.update', message);
    return message;
  }
}
