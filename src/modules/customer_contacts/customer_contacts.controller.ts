import { messaging } from 'firebase-admin';
import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CustomerContactsService } from './customer_contacts.service';
import {
  CustomerContactRequest,
  FilterCustomerContact,
  RejectNote,
} from './dto/contact.dto';
import { Public } from 'src/decorators/public.decorator';
import { IPaginateResponse } from '../base/filter.pagination';
import { CustomerContactPagination } from './dto/contact.pagination';
import { Roles } from 'src/decorators/role.decorator';
import { EContactInformation, ERole } from 'src/common/enum/enum';
import { GetUser } from 'src/decorators/getUser.decorator';

@Controller('customer-contacts')
@ApiTags('Customer Contacts')
export class CustomerContactsController {
  constructor(
    private readonly customerContactsService: CustomerContactsService,
  ) {}

  @Get('/info')
  @ApiBearerAuth()
  @Roles(ERole.ADMIN, ERole.MANAGER)
  async getAllContacts(
    @Query() customerContactPagination: CustomerContactPagination,
    @Query() filter: FilterCustomerContact,
    @GetUser() user: string,
  ): Promise<IPaginateResponse<unknown>> {
    return await this.customerContactsService.getAllContacts(
      customerContactPagination,
      filter,
      JSON.parse(user),
    );
  }

  @Post('/messsage')
  @Public()
  async leaveMessage(
    @Body() contact: CustomerContactRequest,
  ): Promise<string | undefined> {
    try {
      return await this.customerContactsService.leaveMessage(contact);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  @Put('/:contactId/status')
  @ApiBearerAuth()
  @Roles(ERole.ADMIN, ERole.MANAGER)
  @ApiQuery({
    name: 'status',
    type: 'enum',
    enum: [EContactInformation.ACCEPT, EContactInformation.REJECT],
  })
  @ApiBody({
    type: RejectNote,
    required: false,
  })
  async updateStatus(
    @GetUser() user: string,
    @Param('contactId') contactId: string,
    @Body() rejectNote: RejectNote,
    @Query('status') status: EContactInformation,
  ): Promise<string | undefined> {
    return await this.customerContactsService.updateStatus(
      JSON.parse(user),
      contactId,
      status,
      rejectNote,
    );
  }
}
