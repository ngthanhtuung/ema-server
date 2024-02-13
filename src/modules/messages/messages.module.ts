import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './messages.entity';
import { ConversationsEntity } from '../conversations/conversations.entity';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessageController } from './message.controller';
import { Services } from 'src/utils/constants';
import { MessageService } from './message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity, ConversationsEntity]),
    ConversationsModule,
  ],
  controllers: [MessageController],
  providers: [
    {
      provide: Services.MESSAGES,
      useClass: MessageService,
    },
  ],
})
export class MessagesModule {}
