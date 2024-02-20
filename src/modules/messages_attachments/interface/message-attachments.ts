import { GroupsMessageAttachmentEntity } from 'src/modules/groups_messages_attachments/groups_messages_attachments.entity';
import { MessageAttachmentsEntity } from '../messages_attachments.entity';
import { Attachment } from 'src/utils/types';

export interface IMessageAttachmentsService {
  create(attachments: Attachment[]): Promise<MessageAttachmentsEntity[]>;
  createGroupAttachments(
    attachments: Attachment[],
  ): Promise<GroupsMessageAttachmentEntity[]>;
  deleteAllAttachments(attachments: MessageAttachmentsEntity[]);
}
