import { Controller, Get, Put, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { IPaginateResponse } from '../base/filter.pagination';
import { GetUser } from 'src/decorators/getUser.decorator';
import { NotificationResponse } from './dto/notification.response';

@Controller('notification')
@ApiTags('Notification')
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getAllNotifications(
    @GetUser() user: string,
    @Query() notificationPagination: QueryNotificationDto,
  ): Promise<IPaginateResponse<NotificationResponse>> {
    return await this.notificationService.getMyNotifications(
      JSON.parse(user).id,
      notificationPagination,
    );
  }

  @Put('/seen')
  async seenNotification(
    @Query('notificationId') notificationId: string,
  ): Promise<string> {
    return await this.notificationService.seenNotification(notificationId);
  }

  @Put('/seen-all')
  async seenAllNotifications(@GetUser() user: string): Promise<string> {
    return await this.notificationService.seenAllNotification(
      JSON.parse(user).id,
    );
  }
}
