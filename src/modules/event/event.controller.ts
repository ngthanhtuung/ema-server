import { EventPagination } from './dto/event.pagination';
import { Body, Controller, Get, Param, Post, Query, Put } from '@nestjs/common';
import { EventService } from './event.service';
import { IPaginateResponse } from '../base/filter.pagination';
import { EventResponse } from './dto/event.response';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  EventAssignRequest,
  EventCreateRequest,
  EventUpdateRequest,
  FilterEvent,
} from './dto/event.request';
import { EEventStatus, ERole } from 'src/common/enum/enum';
import { Roles } from 'src/decorators/role.decorator';
import { GetUser } from 'src/decorators/getUser.decorator';

@Controller('event')
@ApiBearerAuth()
@ApiTags('Event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /**
   * getAllEventByDivisionID
   * @param data
   */

  @Get('/division')
  @Roles(ERole.STAFF, ERole.EMPLOYEE)
  async getAllEventByDivisionID(
    @GetUser() user: string,
  ): Promise<Array<EventResponse>> {
    return await this.eventService.getAllEventByDivisionID(
      JSON.parse(user).divisionId,
    );
  }

  /**
   *
   * @param filter
   * @returns
   */
  @Get('/filterEventByCondition')
  async filterEventByCondition(
    @Query() filter: FilterEvent,
    @Query() eventPagination: EventPagination,
  ): Promise<IPaginateResponse<EventResponse>> {
    return await this.eventService.filterEventByCondition(
      filter,
      eventPagination,
    );
  }

  /**
   * getEventById
   * @param data
   */

  @Get('/:eventId')
  @Roles(ERole.MANAGER, ERole.STAFF, ERole.EMPLOYEE)
  async getEventById(@Param('eventId') id: string): Promise<EventResponse> {
    return await this.eventService.getEventById(id);
  }

  /**
   * createEvent
   * @param data
   */
  @Post()
  @Roles(ERole.MANAGER)
  async createEvent(
    @Body() data: EventCreateRequest,
  ): Promise<string | undefined> {
    return await this.eventService.createEvent(data);
  }

  /**
   * editDivisionIntoEvent
   * @param data
   */
  @Put('/edit-division')
  @Roles(ERole.MANAGER)
  async editDivisionIntoEvent(
    @Body() data: EventAssignRequest,
  ): Promise<string | undefined> {
    return await this.eventService.editDivisionIntoEvent(data);
  }
  /**
   * updateEvent
   * @param data
   */
  @Put('/:eventId')
  @Roles(ERole.MANAGER)
  async updateEvent(
    @Param('eventId') eventId: string,
    @Body() data: EventUpdateRequest,
  ): Promise<string | undefined> {
    return await this.eventService.updateEvent(eventId, data);
  }

  @Put('/:eventId/:status')
  @Roles(ERole.MANAGER)
  @ApiParam({ name: 'status', enum: EEventStatus })
  async updateEventStatus(
    @Param('eventId') eventId: string,
    @Param('status') status: EEventStatus,
  ): Promise<string> {
    return await this.eventService.updateEventStatus(eventId, status);
  }

  @Put('/:eventId/check-in')
  async generateQrCode(@Param('eventId') eventId: string): Promise<boolean> {
    console.log('EventId: ', eventId);
    return await this.eventService.generateCheckInQRCode(eventId);
  }
}
