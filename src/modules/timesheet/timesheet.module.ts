import { Module } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';
import { TimesheetController } from './timesheet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimesheetEntity } from './timesheet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimesheetEntity])],
  controllers: [TimesheetController],
  providers: [TimesheetService],
})
export class TimesheetModule {}
