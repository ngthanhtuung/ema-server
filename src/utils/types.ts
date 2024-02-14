import { Request } from 'express';
import { ConversationsEntity } from 'src/modules/conversations/conversations.entity';
import { GroupsEntity } from 'src/modules/groups/groups.entity';
import { GroupsMessageEntity } from 'src/modules/groups_messages/groups_messages.entity';
import { GroupsMessageAttachmentEntity } from 'src/modules/groups_messages_attachments/groups_messages_attachments.entity';
import { MessageEntity } from 'src/modules/messages/messages.entity';
import { MessageAttachmentsEntity } from 'src/modules/messages_attachments/messages_attachments.entity';
import { UserEntity } from 'src/modules/user/user.entity';

export type CreateUserDetails = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type ValidateUserDetails = {
  username: string;
  password: string;
};

export type FindUserParams = Partial<{
  id: number;
  email: string;
  username: string;
}>;

export type FindUserOptions = Partial<{
  selectAll: boolean;
}>;

export type CreateConversationParams = {
  email: string;
  message?: string;
};

export type ConversationIdentityType = 'author' | 'recipient';

export type FindParticipantParams = Partial<{
  id: number;
}>;

export interface AuthenticatedRequest extends Request {
  user: UserEntity;
}

export type CreateParticipantParams = {
  id: number;
};

export type CreateMessageParams = {
  id: string;
  content?: string;
  attachments?: Attachment[];
  user: UserEntity;
};

export type CreateMessageResponse = {
  message: MessageEntity;
  conversation: ConversationsEntity;
};

export type DeleteMessageParams = {
  userId: string;
  conversationId: string;
  messageId: string;
};

export type FindMessageParams = {
  userId: string;
  conversationId: string;
  messageId: string;
};

export type EditMessageParams = {
  conversationId: string;
  messageId: string;
  userId: string;
  content: string;
};

export type EditGroupMessageParams = {
  groupId: string;
  messageId: string;
  userId: string;
  content: string;
};

export type CreateGroupParams = {
  creator: UserEntity;
  title?: string;
  users: string[];
};

export type FetchGroupsParams = {
  userId: number;
};

export type CreateGroupMessageParams = {
  author: UserEntity;
  attachments?: Attachment[];
  content: string;
  groupId: number;
};

export type CreateGroupMessageResponse = {
  message: GroupsMessageEntity;
  group: GroupsEntity;
};

export type DeleteGroupMessageParams = {
  userId: number;
  groupId: number;
  messageId: number;
};

export type AddGroupRecipientParams = {
  id: number;
  username: string;
  userId: number;
};

export type RemoveGroupRecipientParams = {
  id: number;
  removeUserId: number;
  issuerId: number;
};

export type AddGroupUserResponse = {
  group: GroupsEntity;
  user: UserEntity;
};

export type RemoveGroupUserResponse = {
  group: GroupsEntity;
  user: UserEntity;
};

export type AccessParams = {
  id: string;
  userId: string;
};

export type TransferOwnerParams = {
  userId: string;
  groupId: string;
  newOwnerId: string;
};

export type LeaveGroupParams = {
  id: string;
  userId: string;
};

export type CheckUserGroupParams = {
  id: string;
  userId: string;
};

export type CreateFriendParams = {
  user: UserEntity;
  username: string;
};

export type FriendRequestStatus = 'accepted' | 'pending' | 'rejected';

export type UserProfileFiles = Partial<{
  banner: Express.Multer.File[];
  avatar: Express.Multer.File[];
}>;

export type UpdateUserProfileParams = Partial<{
  about: string;
  banner: Express.Multer.File;
  avatar: Express.Multer.File;
}>;

export type ImagePermission = 'public-read' | 'private';
export type UploadImageParams = {
  key: string;
  file: Express.Multer.File;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Attachment extends Express.Multer.File {}

export type UploadMessageAttachmentParams = {
  file: Attachment;
  messageAttachment: MessageAttachmentsEntity;
};

export type UploadGroupMessageAttachmentParams = {
  file: Attachment;
  messageAttachment: GroupsMessageAttachmentEntity;
};

export type GetConversationMessagesParams = {
  id: string;
  limit: number;
};

export type UpdateConversationParams = Partial<{
  id: string;
  lastMessageSent: MessageEntity;
}>;

export type UserPresenceStatus = 'online' | 'away' | 'offline' | 'dnd';

export type UpdateStatusMessageParams = {
  user: UserEntity;
  statusMessage: string;
};

export type CallHangUpPayload = {
  receiver: UserEntity;
  caller: UserEntity;
};

export type VoiceCallPayload = {
  conversationId: number;
  recipientId: number;
};

export type CallAcceptedPayload = {
  caller: UserEntity;
};

export type UpdateGroupDetailsParams = {
  id: string;
  title?: string;
  avatar?: Attachment;
};
