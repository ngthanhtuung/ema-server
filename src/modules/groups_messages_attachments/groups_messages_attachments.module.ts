import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsMessageAttachmentEntity } from './groups_messages_attachments.entity';
import { GroupsMessagesAttachmentsService } from './groups_messages_attachments.service';
import { GroupsMessagesAttachmentsController } from './groups_messages_attachments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GroupsMessageAttachmentEntity])],
  controllers: [GroupsMessagesAttachmentsController],
  providers: [GroupsMessagesAttachmentsService],
})
export class GroupsMessagesAttachmentsModule {}
