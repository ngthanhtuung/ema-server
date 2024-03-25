import { Controller, Delete, Get, Put, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { IPaginateResponse } from '../base/filter.pagination';
import { GetUser } from 'src/decorators/getUser.decorator';

@Controller('notification')
@ApiTags('Notification')
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiQuery({
    name: 'type',
    type: 'enum',
    enum: ['ALL', 'READ', 'UNREAD'],
  })
  async getAllNotifications(
    @GetUser() user: string,
    @Query() notificationPagination: QueryNotificationDto,
    @Query('type') filter: string,
  ): Promise<IPaginateResponse<unknown>> {
    return await this.notificationService.getMyNotifications(
      JSON.parse(user).id,
      notificationPagination,
      filter,
    );
  }

  @Put('/seen')
  async seenNotification(
    @Query('notificationId') notificationId: string,
    @GetUser() user: string,
  ): Promise<string> {
    return await this.notificationService.seenNotification(
      notificationId,
      JSON.parse(user).id,
    );
  }

  @Put('/seen-all')
  async seenAllNotifications(@GetUser() user: string): Promise<string> {
    return await this.notificationService.seenAllNotification(
      JSON.parse(user).id,
    );
  }

  @Delete('/delete')
  async deleteNotificationById(
    @Query('notificationId') notificationId: string,
    @GetUser() user: string,
  ): Promise<string> {
    return await this.notificationService.deleteNotificationById(
      notificationId,
      JSON.parse(user).id,
    );
  }

  @Delete('/delete-all')
  async deleteAllNotification(@GetUser() user: string): Promise<string> {
    return await this.notificationService.deleteAllNotification(
      JSON.parse(user).id,
    );
  }
}
