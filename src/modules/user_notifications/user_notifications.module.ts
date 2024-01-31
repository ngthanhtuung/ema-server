import { Module } from '@nestjs/common';
import { UserNotificationsService } from './user_notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotificationsEntity } from './user_notifications.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserNotificationsEntity])],
  providers: [UserNotificationsService],
  exports: [UserNotificationsService],
})
export class UserNotificationsModule {}
