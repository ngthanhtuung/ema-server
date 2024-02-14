/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from '../messages/messages.entity';
import { IConversationsService } from './interface/conversations';
import { Services } from 'src/utils/constants';
import {
  AccessParams,
  CreateConversationParams,
  GetConversationMessagesParams,
  UpdateConversationParams,
} from 'src/utils/types';
import { UserEntity } from '../user/user.entity';
import { ConversationExistsException } from './exceptions/ConversationExists';
import { ConversationNotFoundException } from './exceptions/ConversationNotFound';
import { ConversationsEntity } from 'src/modules/conversations/conversations.entity';
import { UserService } from '../user/user.service';
import { ConservationsPagination } from './dtos/conversations.pagination';
import { IPaginateResponse } from '../base/filter.pagination';

@Injectable()
export class ConversationsService implements IConversationsService {
  constructor(
    @InjectRepository(ConversationsEntity)
    private readonly conversationRepository: Repository<ConversationsEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private readonly userService: UserService,
  ) {}

  /**
   * getConversations
   * @param id
   * @returns
   */
  async getConversations(
    id: string,
    conservationsPagination: ConservationsPagination,
  ): Promise<IPaginateResponse<ConversationsEntity[]>> {
    const { sizePage, currentPage } = conservationsPagination;
    const offset = sizePage * (currentPage - 1);
    const data = await this.conversationRepository.find({
      where: [
        {
          creator: { id },
        },
        {
          recipient: { id },
        },
      ],
      skip: offset,
      take: sizePage,
      order: {
        lastMessageSentAt: 'DESC',
      },
      select: {
        lastMessageSent: {
          id: true,
          content: true,
        },
        creator: {
          id: true,
          email: true,
          profile: {
            avatar: true,
            fullName: true,
          },
        },
        recipient: {
          id: true,
          email: true,
          profile: {
            avatar: true,
            fullName: true,
          },
        },
      },
      relations: {
        lastMessageSent: true,
        creator: {
          profile: true,
        },
        recipient: {
          profile: true,
        },
      },
    });

    console.log('data:', data);

    const total = await this.conversationRepository.count({
      where: [
        {
          creator: { id },
        },
        {
          recipient: { id },
        },
      ],
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
   * findById
   * @param id
   * @returns
   */
  async findById(id: string): Promise<ConversationsEntity> {
    return this.conversationRepository.findOne({
      where: {
        id,
      },
      order: {
        lastMessageSentAt: 'DESC',
      },
      select: {
        lastMessageSent: {
          id: true,
          content: true,
        },
        creator: {
          id: true,
          email: true,
          profile: {
            avatar: true,
            fullName: true,
          },
        },
        recipient: {
          id: true,
          email: true,
          profile: {
            avatar: true,
            fullName: true,
          },
        },
      },
      relations: {
        lastMessageSent: true,
        creator: {
          profile: true,
        },
        recipient: {
          profile: true,
        },
      },
    });
  }

  /**
   * isCreated
   * @param userId
   * @param recipientId
   * @returns
   */
  async isCreated(userId: string, recipientId: string) {
    return this.conversationRepository.findOne({
      where: [
        {
          creator: { id: userId },
          recipient: { id: recipientId },
        },
        {
          creator: { id: recipientId },
          recipient: { id: userId },
        },
      ],
    });
  }

  /**
   * createConversation
   * @param creator
   * @param params
   * @returns
   */
  async createConversation(
    creator: UserEntity,
    params: CreateConversationParams,
  ) {
    const { email, message: content } = params;
    const recipient = (await this.userService.findUser(email))[0];
    if (!recipient) throw new NotFoundException('Recipient not found !!!');
    if (creator.id === recipient.id) {
      throw new BadRequestException('Cannot create Conversation with yourself');
    }
    const exists = await this.isCreated(creator.id, recipient.id);
    if (exists) throw new ConversationExistsException();
    const newConversation = this.conversationRepository.create({
      creator,
      recipient,
    });
    const conversation = await this.conversationRepository.save(
      newConversation,
    );
    if (content) {
      const newMessage = this.messageRepository.create({
        content,
        conversation,
        author: creator,
      });
      await this.messageRepository.save(newMessage);
      await this.conversationRepository.update(
        {
          id: conversation.id,
        },
        {
          lastMessageSent: {
            id: newMessage.id,
          },
        },
      );
    }
    return conversation;
  }

  /**
   * hasAccess
   * @param param0
   * @returns
   */
  async hasAccess({ id, userId }: AccessParams) {
    const conversation = await this.findById(id);
    if (!conversation) throw new ConversationNotFoundException();
    return (
      conversation.creator.id === userId || conversation.recipient.id === userId
    );
  }

  /**
   * save
   * @param conversation
   * @returns
   */
  save(conversation: ConversationsEntity): Promise<ConversationsEntity> {
    return this.conversationRepository.save(conversation);
  }

  /**
   * getMessages
   * @param param0
   * @returns
   */
  getMessages({
    id,
    limit,
  }: GetConversationMessagesParams): Promise<ConversationsEntity> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .where('id = :id', { id })
      .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('conversation.messages', 'message')
      .where('conversation.id = :id', { id })
      .orderBy('message.createdAt', 'DESC')
      .limit(limit)
      .getOne();
  }

  /**
   * update
   * @param param0
   * @returns
   */
  update({ id, lastMessageSent }: UpdateConversationParams) {
    return this.conversationRepository.update(id, { lastMessageSent });
  }
}
