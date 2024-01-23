import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NotificationEntity } from './notification.entity';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { NotificationResponse } from './dto/notification.response';
import { plainToInstance } from 'class-transformer';
import { IPaginateResponse, paginateResponse } from '../base/filter.pagination';
import { BaseService } from '../base/base.service';
import { NotificationCreateRequest } from './dto/notification.request';
import { UserService } from '../user/user.service';
import * as moment from 'moment-timezone';
import * as firebaseAdmin from 'firebase-admin';
@Injectable()
export class NotificationService extends BaseService<NotificationEntity> {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    protected readonly userService: UserService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super(notificationRepository);
  }

  generalBuilderNotification(): SelectQueryBuilder<NotificationEntity> {
    return this.notificationRepository.createQueryBuilder('notifications');
  }

  // async getMyNotifications(
  //   userId: string,
  //   pagination: QueryNotificationDto,
  // ): Promise<IPaginateResponse<NotificationResponse[]>> {
  //   try {
  //     const { currentPage, sizePage } = pagination;
  //     const query = this.generalBuilderNotification();
  //     query.select([
  //       'notifications.id as id',
  //       'notifications.title as title',
  //       'notifications.content as content',
  //       'notifications.type as type',
  //       'notifications.sender as sender',
  //       'notifications.readFlag as readFlag',
  //       'notifications.createdAt as createdAt',
  //       'notifications.commonId as commonId',
  //       'notifications.parentTaskId as parentTaskId',
  //       'notifications.eventId as eventId',
  //     ]);
  //     query.where('notifications.userId = :userId', { userId: userId });
  //     const [result, total] = await Promise.all([
  //       query
  //         .offset((sizePage as number) * ((currentPage as number) - 1))
  //         .limit(sizePage as number)
  //         .orderBy('notifications.createdAt', 'DESC')
  //         .execute(),
  //       query.getCount(),
  //     ]);
  //     const finalRes: NotificationResponse[] = [];
  //     for (const item of result) {
  //       const avatar = (await this.userService.findByIdV2(item?.sender))
  //         ?.avatar;
  //       item.createdAt = moment(item.createdAt)
  //         .add(7, 'hours')
  //         .format('YYYY-MM-DD HH:mm:ss');
  //       const dataUserNotification = {
  //         ...item,
  //         avatarSender: avatar,
  //       };
  //       finalRes.push(dataUserNotification);
  //     }
  //     const data = plainToInstance(NotificationResponse, finalRes);
  //     return paginateResponse<NotificationResponse[]>(
  //       [data, total],
  //       currentPage as number,
  //       sizePage as number,
  //     );
  //   } catch (err) {
  //     throw new InternalServerErrorException(err.message);
  //   }
  // }

  // /**
  //  * seenNotification
  //  * @param notificationId
  //  * @returns
  //  */
  // async seenNotification(notificationId: string): Promise<string> {
  //   try {
  //     const notification = await this.findOne({
  //       where: {
  //         id: notificationId,
  //       },
  //     });
  //     if (notification !== undefined) {
  //       const result = await this.notificationRepository.update(
  //         { id: notificationId },
  //         { readFlag: true },
  //       );
  //       if (result.affected === 0) {
  //         throw new InternalServerErrorException('Update failed');
  //       }
  //       return 'Notification read!';
  //     }
  //     throw new NotFoundException('Notification not found');
  //   } catch (err) {
  //     throw new InternalServerErrorException(err.message);
  //   }
  // }

  // /**
  //  * seenAllNotification
  //  * @param userId
  //  * @returns
  //  */
  // async seenAllNotification(userId: string): Promise<string> {
  //   try {
  //     const listNotification = await this.notificationRepository.find({
  //       where: {
  //         user: {
  //           id: userId,
  //         },
  //       },
  //     });
  //     if (listNotification.length !== 0) {
  //       const dataSeenAll = listNotification?.map((item) => {
  //         return this.notificationRepository.update(
  //           { id: item?.id },
  //           { readFlag: true },
  //         );
  //       });
  //       await Promise.all(dataSeenAll);
  //     }
  //     return 'Notification read!';
  //   } catch (err) {
  //     throw new InternalServerErrorException(err.message);
  //   }
  // }

  // /**
  //  * createNotification
  //  * @param event
  //  * @returns
  //  */
  // async createNotification(
  //   notification: NotificationCreateRequest,
  // ): Promise<unknown> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   try {
  //     await queryRunner.startTransaction();
  //     const newNoti = await queryRunner.manager.insert(NotificationEntity, {
  //       title: notification.title,
  //       content: notification.content,
  //       readFlag: false,
  //       type: notification.type,
  //       sender: notification.sender,
  //       commonId: notification.commonId,
  //       parentTaskId: notification.parentTaskId,
  //       eventId: notification.eventId,
  //       user: {
  //         id: notification.userId,
  //       },
  //     });
  //     await queryRunner.commitTransaction();
  //     return newNoti;
  //   } catch (err) {
  //     await queryRunner.rollbackTransaction();
  //     throw new InternalServerErrorException(err);
  //   }
  // }

  // /**
  //  *
  //  * @param notificationId
  //  * @param userId
  //  * @returns
  //  */

  // async deleteNotificationById(
  //   notificationId: string,
  //   userId: string,
  // ): Promise<string> {
  //   try {
  //     const notification = await this.findOne({
  //       where: {
  //         id: notificationId,
  //         user: {
  //           id: userId,
  //         },
  //       },
  //     });
  //     if (notification !== undefined) {
  //       await this.notificationRepository.delete({
  //         id: notificationId,
  //       });
  //       return 'Notification deleted!';
  //     }
  //     throw new NotFoundException('Notification not found');
  //   } catch (err) {
  //     throw new InternalServerErrorException(err.message);
  //   }
  // }

  // /**
  //  * deleteAllNotification
  //  * @param userId
  //  * @returns
  //  */
  // async deleteAllNotification(userId: string): Promise<string> {
  //   try {
  //     const notification = await this.notificationRepository.find({
  //       where: {
  //         user: {
  //           id: userId,
  //         },
  //       },
  //     });
  //     if (notification.length !== 0) {
  //       const mapData = notification?.map((item) =>
  //         this.notificationRepository.delete({
  //           id: item?.id,
  //         }),
  //       );
  //       await Promise.all(mapData);
  //       return 'Notification deleted!';
  //     }
  //     throw new NotFoundException('Notification not found');
  //   } catch (err) {
  //     throw new InternalServerErrorException(err.message);
  //   }
  // }

  // /**
  //  *
  //  * @param listDeviceToke
  //  * @param title
  //  * @param body
  //  * @returns
  //  */

  // async pushNotificationFirebase(
  //   listDeviceToken: string[],
  //   title: string,
  //   body: string,
  // ): Promise<boolean> {
  //   try {
  //     const deviceTokenArray = listDeviceToken;
  //     const result = firebaseAdmin.messaging().sendEachForMulticast({
  //       tokens: deviceTokenArray,
  //       notification: {
  //         title: title,
  //         body: body,
  //       },
  //     });
  //     return true;
  //   } catch (err) {
  //     return false;
  //   }
  // }
}
