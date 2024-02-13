/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';
import { Routes, Services } from 'src/utils/constants';
import { IConversationsService } from './interface/conversations';
import { GetUser } from 'src/decorators/getUser.decorator';
import { UserEntity } from '../user/user.entity';
import { CreateConversationDto } from './dtos/CreateConversation.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Conversations')
@Controller(Routes.CONVERSATIONS)
@ApiBearerAuth()
export class ConversationsController {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationsService: IConversationsService,
    private readonly events: EventEmitter2,
  ) {}
  @Get('test/endpoint/check')
  test(): Promise<void> {
    return;
  }

  @Post()
  async createConversation(
    @GetUser() user: string,
    @Body() createConversationPayload: CreateConversationDto,
  ) {
    console.log('createConversation');
    const conversation = await this.conversationsService.createConversation(
      JSON.parse(user),
      createConversationPayload,
    );
    this.events.emit('conversation.create', conversation);
    return conversation;
  }

  @Get()
  async getConversations(@GetUser() user: string) {
    const idUser = JSON.parse(user).id;
    return this.conversationsService.getConversations(idUser);
  }

  @Get(':id')
  async getConversationById(@Param('id') id: string) {
    return this.conversationsService.findById(id);
  }
}
