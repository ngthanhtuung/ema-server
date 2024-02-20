import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesAttachmentsService } from './messages_attachments.service';
import { MessagesAttachmentsController } from './messages_attachments.controller';
import { MessageAttachmentsEntity } from './messages_attachments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageAttachmentsEntity])],
  controllers: [MessagesAttachmentsController],
  providers: [MessagesAttachmentsService],
})
export class MessagesAttachmentsModule {}
