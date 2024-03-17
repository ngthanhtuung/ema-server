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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { ERole } from '../../common/enum/enum';
import { Roles } from '../../decorators/role.decorator';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreateItemRequest,
  UpdateItemRequest,
  UpdatePlanRequest,
} from './dto/item.request';
import { GetUser } from '../../decorators/getUser.decorator';
import { EventService } from '../event/event.service';

@Controller('items')
@ApiTags('Planning')
@ApiBearerAuth()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('/download-template')
  @Roles(ERole.MANAGER)
  async exportTemplate(
    @Param('eventTypeId') eventTypeId: string,
  ): Promise<string> {
    try {
      const csvData = await this.itemsService.exportTemplateToCSV(eventTypeId);
      return csvData;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  @Get('/export-plan')
  @Roles(ERole.MANAGER)
  async exportPlanToCSV(
    @Query('customerContactId') customerContactId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const csvData = await this.itemsService.exportPlanToCSV(
        customerContactId,
      );
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

  @Get('/:customerContactId')
  @Roles(ERole.MANAGER)
  async getPlanningByEventId(
    @Param('customerContactId') customerContactId: string,
  ): Promise<unknown> {
    return await this.itemsService.getPlanByCustomerContactId(
      customerContactId,
    );
  }

  @Post('')
  @Roles(ERole.MANAGER)
  @ApiBody({
    type: CreateItemRequest,
    isArray: true,
  })
  async createPlan(
    @Body() data: CreateItemRequest[],
    @Query('customerContactId') customerContactId: string,
    @GetUser() user: string,
  ): Promise<string> {
    return this.itemsService.createEventPlan(
      data,
      customerContactId,
      JSON.parse(user),
    );
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
  @ApiOperation({
    description:
      'Chỉ thực hiện được cập nhật khi hợp đồng của liên hệ này đang có trạng thái là PENDING',
  })
  @Roles(ERole.MANAGER)
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() data: UpdateItemRequest,
    @GetUser() user: string,
  ): Promise<string> {
    return this.itemsService.updateItem(itemId, data, JSON.parse(user));
  }

  @Put(':customerContactId/update-plan/')
  @Roles(ERole.MANAGER)
  @ApiBody({
    type: UpdatePlanRequest,
    isArray: true,
  })
  @ApiOperation({
    description:
      'Chỉ thực hiện được cập nhật khi hợp đồng của liên hệ này đang có trạng thái là PENDING',
  })
  async updatePlan(
    @Param('customerContactId') customerContactId: string,
    @Body() data: UpdatePlanRequest[],
    @GetUser() user: string,
  ): Promise<string> {
    return this.itemsService.updatePlan(
      data,
      customerContactId,
      JSON.parse(user),
    );
  }

  @Delete('/:itemId')
  @ApiOperation({
    description:
      'Chỉ thực hiện được cập nhật khi hợp đồng của liên hệ này đang có trạng thái là PENDING',
  })
  @Roles(ERole.MANAGER)
  async deleteItem(@Param('itemId') itemId: string): Promise<string> {
    return await this.itemsService.deleteItem(itemId);
  }
}
