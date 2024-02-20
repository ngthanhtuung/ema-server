import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsEntity } from './groups.entity';
import { GroupsMessageEntity } from '../groups_messages/groups_messages.entity';
import { UserModule } from '../user/user.module';
import { GroupsController } from './groups.controller';
import { Services } from 'src/utils/constants';
import { GroupsService } from './groups.service';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([GroupsEntity, GroupsMessageEntity]),
  ],
  controllers: [GroupsController],
  providers: [
    {
      provide: Services.GROUPS,
      useClass: GroupsService,
    },
  ],
  exports: [
    {
      provide: Services.GROUPS,
      useClass: GroupsService,
    },
  ],
})
export class GroupsModule {}
