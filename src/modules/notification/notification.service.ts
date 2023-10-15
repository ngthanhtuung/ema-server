import { messaging } from 'firebase-admin';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { NotificationEntity } from './notification.entity';
import { Repository, SelectQueryBuilder, FindManyOptions } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { NotificationResponse } from './dto/notification.response';
import { plainToInstance } from 'class-transformer';
import { IPaginateResponse, paginateResponse } from '../base/filter.pagination';
import { BaseService } from '../base/base.service';

@Injectable()
export class NotificationService extends BaseService<NotificationEntity> {

    constructor(
        @InjectRepository(NotificationEntity)
        private readonly notificationRepository: Repository<NotificationEntity>
    ) {
        super(notificationRepository);
    }

    generalBuilderNotification(): SelectQueryBuilder<NotificationEntity> {
        return this.notificationRepository.createQueryBuilder('notifications');
    }

    async getMyNotifications(
        userId: string,
        pagination: QueryNotificationDto
    ): Promise<IPaginateResponse<NotificationResponse>> {
        try {
            const { currentPage, sizePage } = pagination
            const query = this.generalBuilderNotification();
            query.select([
                'notifications.id as id',
                'notifications.title as title',
                'notifications.content as content',
                'notifications.readFlag as readFlag',
            ])
            query.where('notifications.userId = :userId', { userId: userId })
            const [result, total] = await Promise.all([
                query
                    .offset((sizePage as number) * ((currentPage as number) - 1))
                    .limit(sizePage as number)
                    .orderBy('notifications.id', 'DESC')
                    .execute(),
                query.getCount(),
            ])
            if (result === 0) {
                throw new NotFoundException('Notification not found')
            }
            const data = plainToInstance(NotificationResponse, result)
            return paginateResponse<NotificationResponse>(
                [data, total],
                currentPage as number,
                sizePage as number
            )
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async seenNotification(
        notificationId: string
    ): Promise<string> {
        try {
            const notification = await this.findOne({
                where: {
                    id: notificationId
                }
            })
            if (notification !== undefined) {
                const result = await this.notificationRepository.update({ id: notificationId }, { readFlag: true })
                if (result.affected === 0) {
                    throw new InternalServerErrorException('Update failed')
                }
                return 'Notification read!'
            }
            throw new NotFoundException('Notification not found')
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async seenAllNotification(
        userId: string
    ): Promise<string> {
        try {
            const query = this.generalBuilderNotification();
            query.update(NotificationEntity)
                .set({ readFlag: true })
                .where('userId = :userId', { userId })
            const result = await query.execute();
            if (result.affected === 0) {
                throw new InternalServerErrorException('Update failed')
            }
            return 'Notification read!'
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

}
