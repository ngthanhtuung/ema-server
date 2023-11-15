import { EventService } from './../event/event.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Between, DataSource, Repository } from 'typeorm';
import { TimesheetEntity } from './timesheet.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '../base/base.service';
import * as moment from 'moment';
import { UserService } from '../user/user.service';

@Injectable()
export class TimesheetService extends BaseService<TimesheetEntity> {
  constructor(
    @InjectRepository(TimesheetEntity)
    private readonly timesheetRepository: Repository<TimesheetEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly eventService: EventService,
  ) {
    super(timesheetRepository);
  }

  async checkIn(eventId: string, userId: string): Promise<string> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      queryRunner.startTransaction();
      const userExisted = await this.userService.findOne({
        where: {
          id: userId,
        },
      });
      const eventExisted = await this.eventService.findOne({
        where: {
          id: eventId,
        },
      });
      if (!eventExisted || !userExisted) {
        throw new InternalServerErrorException('Event or User not found');
      }
      // const checkInExisted = await this.checkTimekeepingInEvent(
      //   eventId,
      //   userId,
      //   moment().format('YYYY-MM-DD').toString(),
      //   moment().format('YYYY-MM-DD').toString(),
      //   true,
      // );
      // if (!checkInExisted) {
      // }
      const createTimekeeping = await queryRunner.manager.insert(
        TimesheetEntity,
        {
          date: moment().format('YYYY-MM-DD'),
          checkinTime: moment().format('HH:mm:ss'),
          event: eventExisted,
          user: userExisted,
        },
      );
      await queryRunner.commitTransaction();
      return 'Check-in successfully';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async checkTimekeepingInEvent(
    eventId: string,
    userId: string,
    startDate: string,
    endDate: string,
    // date: string,
    me: boolean,
  ): Promise<TimesheetEntity> {
    try {
      const userExisted = await this.userService.findOne({
        where: {
          id: userId,
        },
      });

      if (!userExisted) {
        throw new InternalServerErrorException('User not found');
      }
      // eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
      let queryConditions: any = {
        event: {
          id: eventId,
        },
      };

      if (me) {
        queryConditions.user = {
          id: userId,
        };
      }
      if (startDate && endDate) {
        const formattedStartDate = moment(startDate, 'YYYY-MM-DD', true);
        const formattedEndDate = moment(endDate, 'YYYY-MM-DD', true);
        if (formattedStartDate.isValid() && formattedEndDate) {
          queryConditions.date = Between(
            formattedStartDate.toDate(),
            formattedEndDate.toDate(),
          );
        } else {
          throw new InternalServerErrorException(
            'Invalid date format. YYYY-MM-DD is correct format',
          );
        }
      }

      const timekeeping = await this.timesheetRepository.findOne({
        where: queryConditions,
        relations: ['event'],
      });
      return timekeeping;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
