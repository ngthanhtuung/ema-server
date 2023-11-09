import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TimesheetEntity } from './timesheet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '../base/base.service';

@Injectable()
export class TimesheetService extends BaseService<TimesheetEntity> {
  constructor(
    @InjectRepository(TimesheetEntity)
    private readonly timesheetRepository: Repository<TimesheetEntity>,
  ) {
    super(timesheetRepository);
  }

  async checkIn(): Promise<void> {
    try {
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
