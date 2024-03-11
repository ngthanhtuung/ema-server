import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { ERole } from '../../common/enum/enum';
import { Roles } from '../../decorators/role.decorator';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateItemRequest, UpdateItemRequest } from './dto/item.request';
import { GetUser } from '../../decorators/getUser.decorator';
import { EventService } from '../event/event.service';

@Controller('items')
@ApiTags('Planning')
@ApiBearerAuth()
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly eventService: EventService,
  ) {}

  @Get('/download-template')
  @Roles(ERole.MANAGER)
  async exportTemplate(@Res() res: Response): Promise<void> {
    try {
      const csvData = await this.itemsService.exportTemplateToCSV();
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=template.csv',
      });
      res.send(csvData);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  @Get('/export-plan')
  @Roles(ERole.MANAGER)
  async exportPlanToCSV(
    @Query('eventId') eventId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const csvData = await this.itemsService.exportPlanToCSV(eventId);
      res.set({
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=KeHoachToChucSuKien.csv',
      });
      res.send(csvData);
    } catch (err) {
      console.error('Error at exportPlanToCSV Controller', err);
      throw new InternalServerErrorException(err.message);
    }
  }

  @Get('/:eventId')
  @Roles(ERole.MANAGER)
  async getPlanningByEventId(
    @Param('eventId') eventId: string,
  ): Promise<unknown> {
    return await this.itemsService.getPlanningByEventId(eventId);
  }

  @Post('')
  @Roles(ERole.MANAGER)
  @ApiBody({
    type: CreateItemRequest,
    isArray: true,
  })
  async createPlan(
    @Body() data: CreateItemRequest[],
    @Query('eventId') eventId: string,
    @GetUser() user: string,
  ): Promise<string> {
    console.log('Event ID at controller: ', eventId);
    return this.itemsService.createEventPlan(data, eventId, JSON.parse(user));
  }

  @Post('/import-csv')
  @ApiConsumes('multipart/form-data')
  @Roles(ERole.MANAGER)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async readCSVFile(
    @UploadedFile('file') file: Express.Multer.File,
  ): Promise<object> {
    return await this.itemsService.readCSVFile(file);
  }

  @Put('/:itemId')
  @Roles(ERole.MANAGER)
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() data: UpdateItemRequest,
    @GetUser() user: string,
  ): Promise<string> {
    return this.itemsService.updateItem(itemId, data, JSON.parse(user));
  }

  @Delete('/:itemId')
  @Roles(ERole.MANAGER)
  async deleteItem(@Param('itemId') itemId: string): Promise<string> {
    return await this.itemsService.deleteItem(itemId);
  }
}
