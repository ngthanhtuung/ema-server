import { EventPagination } from './dto/event.pagination';
import { Body, Controller, Get, Param, Post, Query, Put } from '@nestjs/common';
import { EventService } from './event.service';
import { IPaginateResponse } from '../base/filter.pagination';
import { EventResponse } from './dto/event.response';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  EventAssignRequest,
  EventCreateRequest,
  EventCreateRequestContract,
  EventUpdateRequest,
  FilterEvent,
  GetListEvent,
} from './dto/event.request';
import { EEventDate, EEventStatus, ERole } from 'src/common/enum/enum';
import { Roles } from 'src/decorators/role.decorator';
import { GetUser } from 'src/decorators/getUser.decorator';
import { EventEntity } from './event.entity';
import { ContractCreateRequest } from '../contracts/dto/contract.dto';

@Controller('event')
@ApiBearerAuth()
@ApiTags('Event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('')
  async getUserInEvent(@Query('eventId') eventId: string): Promise<unknown> {
    return await this.eventService.getUserInEvent(eventId);
  }

  @Get('/user/doing')
  async getAllEventUserDoing(
    @Query() data: GetListEvent,
  ): Promise<EventEntity[]> {
    return await this.eventService.getAllEventUserDoing(data);
  }

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
   * getAllEventByCustomer
   * @param data
   */

  @Get('/customer')
  @Roles(ERole.CUSTOMER)
  async getAllEventByCustomer(@GetUser() user: string): Promise<EventEntity[]> {
    return await this.eventService.getAllEventByCustomer(
      JSON.parse(user).email,
    );
  }

  /**
   * getEventTemplate
   */

  @Get('/template-event')
  async getEventTemplate(): Promise<EventResponse> {
    return await this.eventService.getEventTemplate();
  }

  /**
   *
   * @param filter
   * @returns
   */
  @Get('/filter')
  async filterEventByCondition(
    @Query() filter: FilterEvent,
    @Query() eventPagination: EventPagination,
  ): Promise<IPaginateResponse<EventResponse>> {
    return await this.eventService.filterEventByCondition(
      filter,
      eventPagination,
    );
  }

  @Get('/statistic')
  @ApiQuery({
    name: 'mode',
    enum: EEventStatus,
    required: false,
  })
  async eventStatistic(
    @Query('mode') mode: EEventStatus,
    @GetUser() user: string,
  ): Promise<unknown> {
    console.log('Mode: ', mode);
    return await this.eventService.eventStatistics(mode, user);
  }

  /**
   * getEventById
   * @param data
   */

  @Get('/:eventId')
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
    @Query('contactId') contactId: string,
    @GetUser() user: string,
  ): Promise<string | undefined> {
    return await this.eventService.createEvent(
      data,
      JSON.parse(user),
      contactId,
    );
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
    @GetUser() user: string,
  ): Promise<string | undefined> {
    return await this.eventService.updateEvent(eventId, data, JSON.parse(user));
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
}
