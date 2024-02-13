import {
  AccessParams,
  CreateConversationParams,
  GetConversationMessagesParams,
  UpdateConversationParams,
} from 'src/utils/types';
import { ConversationsEntity } from '../conversations.entity';
import { UserEntity } from 'src/modules/user/user.entity';

export interface IConversationsService {
  createConversation(
    user: UserEntity,
    conversationParams: CreateConversationParams,
  ): Promise<ConversationsEntity>;
  getConversations(id: string): Promise<ConversationsEntity[]>;
  findById(id: string): Promise<ConversationsEntity | undefined>;
  hasAccess(params: AccessParams): Promise<boolean>;
  isCreated(
    userId: string,
    recipientId: string,
  ): Promise<ConversationsEntity | undefined>;
  save(conversation: ConversationsEntity): Promise<ConversationsEntity>;
  getMessages(
    params: GetConversationMessagesParams,
  ): Promise<ConversationsEntity>;
  update(params: UpdateConversationParams);
}
