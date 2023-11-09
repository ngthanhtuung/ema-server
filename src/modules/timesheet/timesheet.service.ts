import { EventService } from './../event/event.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
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

  async checkOut(): Promise<void> {
    try {
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
