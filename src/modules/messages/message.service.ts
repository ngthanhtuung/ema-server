/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { Repository } from 'typeorm';
import { MessageEntity } from './messages.entity';
import { IMessageService } from './interface/message';
import { Services } from 'src/utils/constants';
import { IConversationsService } from '../conversations/interface/conversations';
import {
  CreateMessageParams,
  DeleteMessageParams,
  EditMessageParams,
} from 'src/utils/types';
import { ConversationNotFoundException } from '../conversations/exceptions/ConversationNotFound';
import { CannotCreateMessageException } from './exceptions/CannotCreateMessage';
import { CannotDeleteMessage } from './exceptions/CannotDeleteMessage';
import { ConversationsEntity } from '../conversations/conversations.entity';
import { MessagesPagination } from './dtos/messages.pagination';
import { IPaginateResponse } from '../base/filter.pagination';

@Injectable()
export class MessageService implements IMessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    @Inject(Services.CONVERSATIONS)
    private readonly conversationService: IConversationsService, // @Inject(Services.MESSAGE_ATTACHMENTS) // private readonly messageAttachmentsService: IMessageAttachmentsService,
  ) {}

  /**
   * createMessage
   * @param params
   * @returns
   */
  async createMessage(params: CreateMessageParams) {
    const { user, content, id } = params;
    console.log('params:', params);

    const conversation = await this.conversationService.findById(id);
    console.log('conversation:', conversation);

    if (!conversation) throw new ConversationNotFoundException();
    const { creator, recipient } = conversation;
    if (creator?.id !== user?.id && recipient?.id !== user?.id)
      throw new CannotCreateMessageException();
    const message = this.messageRepository.create({
      content,
      conversation,
      author: instanceToPlain(user),
    });
    const savedMessage = await this.messageRepository.save(message);
    conversation.lastMessageSent = savedMessage;
    const mapDataMessage = await this.messageRepository.findOne({
      where: {
        id: savedMessage.id,
      },
      select: {
        author: {
          id: true,
          email: true,
          profile: {
            fullName: true,
            avatar: true,
          },
        },
      },
      relations: {
        author: {
          profile: true,
        },
      },
    });
    const updated = await this.conversationService.save(conversation);
    return { message: mapDataMessage, conversation: updated };
  }

  /**
   * getMessages
   * @param conversationId
   * @returns
   */
  async getMessages(
    conversationId: string,
    messagesPagination: MessagesPagination,
  ): Promise<IPaginateResponse<MessageEntity[]>> {
    const { sizePage, currentPage } = messagesPagination;
    const offset = sizePage * (currentPage - 1);
    const data = await this.messageRepository.find({
      relations: ['author', 'attachments', 'author.profile'],
      where: { conversation: { id: conversationId } },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: sizePage,
      select: {
        author: {
          id: true,
          email: true,
          profile: {
            fullName: true,
            avatar: true,
          },
        },
      },
    });
    const total = await this.messageRepository.count({
      where: { conversation: { id: conversationId } },
    });
    console.log('total:', total);
    const lastPage: number = Math.ceil(total / sizePage);
    const nextPage: number =
      currentPage + 1 > lastPage ? null : currentPage + 1;
    const prevPage: number = currentPage - 1 < 1 ? null : currentPage - 1;
    return {
      currentPage: currentPage,
      nextPage: nextPage,
      prevPage: prevPage,
      lastPage: lastPage,
      totalItems: total,
      data: data,
    };
  }

  /**
   * deleteMessage
   * @param params
   * @returns
   */
  async deleteMessage(params: DeleteMessageParams) {
    const { conversationId } = params;
    const msgParams = { id: conversationId, limit: 5 };
    const conversation = await this.conversationService.getMessages(msgParams);
    if (!conversation) throw new ConversationNotFoundException();
    const message = await this.messageRepository.findOne({
      where: {
        id: params.messageId,
      },
    });
    if (!message) throw new CannotDeleteMessage();
    if (conversation.lastMessageSent.id !== message.id)
      return this.messageRepository.delete({ id: message.id });
    return this.deleteLastMessage(conversation, message);
  }

  /**
   * deleteLastMessage
   * @param conversation
   * @param message
   * @returns
   */
  async deleteLastMessage(
    conversation: ConversationsEntity,
    message: MessageEntity,
  ) {
    const size = conversation.messages.length;
    const SECOND_MESSAGE_INDEX = 1;
    if (size <= 1) {
      console.log('Last Message Sent is deleted');
      await this.conversationService.update({
        id: conversation.id,
        lastMessageSent: null,
      });
      return this.messageRepository.delete({ id: message.id });
    } else {
      console.log('There are more than 1 message');
      const newLastMessage = conversation.messages[SECOND_MESSAGE_INDEX];
      await this.conversationService.update({
        id: conversation.id,
        lastMessageSent: newLastMessage,
      });
      return this.messageRepository.delete({ id: message.id });
    }
  }

  /**
   * editMessage
   * @param params
   * @returns
   */
  async editMessage(params: EditMessageParams) {
    const messageDB = await this.messageRepository.findOne({
      where: {
        id: params.messageId,
        author: { id: params.userId },
      },
      relations: [
        'conversation',
        'conversation.creator',
        'conversation.recipient',
        'author',
        'author.profile',
      ],
    });
    if (!messageDB)
      throw new HttpException('Cannot Edit Message', HttpStatus.BAD_REQUEST);
    messageDB.content = params.content;
    return this.messageRepository.save(messageDB);
  }
}
