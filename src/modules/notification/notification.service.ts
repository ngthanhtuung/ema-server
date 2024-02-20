import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { NotificationEntity } from './notification.entity';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { IPaginateResponse } from '../base/filter.pagination';
import { BaseService } from '../base/base.service';
import { NotificationCreateRequest } from './dto/notification.request';
import { UserService } from '../user/user.service';
import * as moment from 'moment-timezone';
import { UserNotificationsEntity } from '../user_notifications/user_notifications.entity';
import { UserNotificationsService } from '../user_notifications/user_notifications.service';
import { FirebaseMessageService } from 'src/providers/firebase/message/firebase-message.service';
import { FirebaseNotificationRequest } from 'src/providers/firebase/message/dto/firebase-notification.dto';
import { AppGateway } from 'src/sockets/app.gateway';
import { Services } from 'src/utils/constants';
import { IGatewaySessionManager } from 'src/sockets/gateway.session';
@Injectable()
export class NotificationService extends BaseService<NotificationEntity> {
  constructor(
    @Inject(forwardRef(() => AppGateway))
    private readonly appGateWay: AppGateway,
    @Inject(Services.GATEWAY_SESSION_MANAGER)
    readonly sessions: IGatewaySessionManager,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    protected readonly userService: UserService,
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly firebaseCustomService: FirebaseMessageService,
    private readonly userNotificationService: UserNotificationsService,
  ) {
    super(notificationRepository);
  }

  generalBuilderNotification(): SelectQueryBuilder<NotificationEntity> {
    return this.notificationRepository.createQueryBuilder('notifications');
  }

  async getMyNotifications(
    userId: string,
    pagination: QueryNotificationDto,
  ): Promise<IPaginateResponse<unknown>> {
    try {
      return await this.userNotificationService.getMyNotifications(
        userId,
        pagination,
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * seenNotification
   * @param notificationId
   * @returns
   */
  async seenNotification(
    notificationId: string,
    userId: string,
  ): Promise<string> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const notification = await queryRunner.manager.findOne(
        UserNotificationsEntity,
        {
          where: { id: notificationId },
          relations: ['user'],
        },
      );
      if (notification.user.id !== userId) {
        throw new BadRequestException('Your are not allowed to do this action');
      }
      const readNotification = await queryRunner.manager.update(
        UserNotificationsEntity,
        {
          id: notificationId,
        },
        {
          isRead: true,
          readAt: moment.tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
        },
      );
      if (readNotification.affected > 0) {
        return 'Notification read!';
      }
      throw new NotFoundException('Notification not found');
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * seenAllNotification
   * @param userId
   * @returns
   */
  async seenAllNotification(userId: string): Promise<string> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const readNotification = await queryRunner.manager.update(
        UserNotificationsEntity,
        {
          user: { id: userId },
        },
        {
          isRead: true,
          readAt: moment.tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
        },
      );
      if (readNotification.affected > 0) {
        return 'Notification read all';
      }
      throw new NotFoundException('Notification not found');
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * createNotification
   * @returns
   */
  async createNotification(
    notification: NotificationCreateRequest,
    senderUser: string,
  ): Promise<unknown> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      const client = this.appGateWay.server;
      await queryRunner.startTransaction();
      const newNoti = await queryRunner.manager.insert(NotificationEntity, {
        title: notification.title,
        content: notification.content,
        type: notification.type,
        commonId: notification?.commonId,
        parentTaskId: notification?.parentTaskId,
        eventID: notification?.eventID,
      });
      const createNotification = [];
      const listUserPushNoti = [];
      let dataNotification;
      for (
        let index = 0;
        index < notification?.userIdAssignee?.length;
        index++
      ) {
        const idUser = notification?.userIdAssignee[index];
        if (idUser !== senderUser) {
          dataNotification = {
            title: notification.title,
            content: notification.content,
            readFlag: false,
            type: notification.type,
            userId: idUser,
            eventID: notification?.eventID,
            parentTaskId: notification?.parentTaskId,
            commonId: notification?.commonId,
            avatarSender: notification?.avatar,
          };
          const socket = this.sessions.getUserSocket(idUser);
          if (socket !== null) {
            client
              .to(socket?.id)
              .emit(notification.messageSocket, dataNotification);
          }
          createNotification.push(
            queryRunner.manager.insert(UserNotificationsEntity, {
              user: { id: idUser },
              notification: { id: newNoti?.identifiers[0]?.id },
            }),
          );
          listUserPushNoti.push(idUser);
        }
      }
      // Notificaiton task master
      if (notification?.userIdTaskMaster?.[0] !== senderUser) {
        const socket = this.sessions.getUserSocket(
          notification?.userIdTaskMaster?.[0],
        );
        dataNotification = {
          title: notification.title,
          content: notification.content,
          readFlag: false,
          type: notification.type,
          userId: notification?.userIdTaskMaster?.[0],
          eventID: notification?.eventID,
          parentTaskId: notification?.parentTaskId,
          commonId: notification?.commonId,
          avatarSender: notification?.avatar,
        };
        if (socket !== null) {
          client
            .to(socket.id)
            .emit(notification?.messageSocket, dataNotification);
        }
        createNotification.push(
          queryRunner.manager.insert(UserNotificationsEntity, {
            user: { id: notification?.userIdTaskMaster?.[0] },
            notification: { id: newNoti.identifiers[0].id },
          }),
        );
        listUserPushNoti.push(notification?.userIdTaskMaster?.[0]);
      }
      // Insert data in UserNotificationsEntity
      await Promise.all(createNotification);
      const firebaseNotificationPayload: FirebaseNotificationRequest = {
        title: notification?.title,
        body: notification?.content,
        listUser: listUserPushNoti,
      };
      await this.firebaseCustomService.sendCustomNotificationFirebase(
        firebaseNotificationPayload,
      );
      await queryRunner.commitTransaction();
      if (newNoti?.raw?.affectedRows > 0) {
        return 'Create notification successfully!';
      }
      throw new InternalServerErrorException('Create notification failed!');
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    }
  }

  /**
   *
   * @param notificationId
   * @param userId
   * @returns
   */

  async deleteNotificationById(
    notificationId: string,
    userId: string,
  ): Promise<string> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const notification = await queryRunner.manager.findOne(
        UserNotificationsEntity,
        {
          where: { id: notificationId },
          relations: ['user'],
        },
      );
      if (notification.user.id !== userId) {
        throw new BadRequestException('Your are not allowed to do this action');
      }
      const deleteNotification = await queryRunner.manager.update(
        UserNotificationsEntity,
        {
          id: notificationId,
        },
        {
          isDelete: true,
          deleteAt: moment.tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
        },
      );
      if (deleteNotification.affected > 0) {
        return 'Notification deleted!';
      }
      throw new NotFoundException('Notification not found');
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * deleteAllNotification
   * @param userId
   * @returns
   */
  async deleteAllNotification(userId: string): Promise<string> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const deleteNotification = await queryRunner.manager.update(
        UserNotificationsEntity,
        {
          user: { id: userId },
        },
        {
          isDelete: true,
          deleteAt: moment.tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
        },
      );
      if (deleteNotification.affected > 0) {
        return 'Notification deleted all';
      }
      throw new NotFoundException('Notification not found');
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
