import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsEntity } from './conversations.entity';
import { MessageEntity } from '../messages/messages.entity';
import { UserModule } from '../user/user.module';
import { ConversationsController } from './conversations.controller';
import { Services } from 'src/utils/constants';
import { ConversationsService } from './conversations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationsEntity, MessageEntity]),
    UserModule,
  ],
  controllers: [ConversationsController],
  providers: [
    {
      provide: Services.CONVERSATIONS,
      useClass: ConversationsService,
    },
  ],
  exports: [
    {
      provide: Services.CONVERSATIONS,
      useClass: ConversationsService,
    },
  ],
})
export class ConversationsModule {}
