import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { UserNotificationsEntity } from './user_notifications.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryNotificationDto } from '../notification/dto/query-notification.dto';
import { IPaginateResponse, paginateResponse } from '../base/filter.pagination';

@Injectable()
export class UserNotificationsService {
  constructor(
    @InjectRepository(UserNotificationsEntity)
    private readonly userNotificationRepository: Repository<UserNotificationsEntity>,
  ) {}

  generalBuilderUserNotification(): SelectQueryBuilder<UserNotificationsEntity> {
    return this.userNotificationRepository.createQueryBuilder(
      'userNotifications',
    );
  }

  async getMyNotifications(
    userId: string,
    pagination: QueryNotificationDto,
  ): Promise<IPaginateResponse<unknown>> {
    try {
      const { currentPage, sizePage } = pagination;
      const query = this.generalBuilderUserNotification();
      query.leftJoinAndSelect('userNotifications.notification', 'notification');
      query.select([
        'userNotifications.id as id',
        'notification.title as title',
        'notification.content as content',
        'notification.type as type',
        'notification.status as status',
        'notification.eventID as eventID',
        'notification.commonId as commonId',
        'notification.parentTaskId as parentTaskId',
        'notification.contractId as contractId',
        'notification.avatarSender as avatarSender',
        'userNotifications.createdAt as createdAt',
        'userNotifications.isRead as isRead',
        'userNotifications.readAt as readAt',
      ]);
      query.where('userNotifications.userId = :userId', { userId });
      query.andWhere('userNotifications.isDelete = :isDelete', {
        isDelete: false,
      });
      query.andWhere('notification.status = :status', { status: true });
      query.orderBy('userNotifications.createdAt', 'DESC');
      const [result, total] = await Promise.all([
        query
          .offset((sizePage as number) * ((currentPage as number) - 1))
          .limit(sizePage as number)
          .execute(),
        query.getCount(),
      ]);
      return paginateResponse<unknown>(
        [result, total],
        currentPage as number,
        sizePage as number,
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
