import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsMessageEntity } from './groups_messages.entity';
import { GroupsMessageService } from './groups_messages.service';
import { GroupsMessageController } from './groups_messages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GroupsMessageEntity])],
  controllers: [GroupsMessageController],
  providers: [GroupsMessageService],
})
export class GroupsMessagesModule {}
