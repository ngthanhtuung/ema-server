import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
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
import { Public } from '../../decorators/public.decorator';
import { CreateItemRequest } from './dto/item.request';
import { GetUser } from '../../decorators/getUser.decorator';

@Controller('items')
@ApiTags('Planning')
@ApiBearerAuth()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('download-template')
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

  @Post('')
  @Roles(ERole.MANAGER)
  @ApiBody({
    type: CreateItemRequest,
    isArray: true,
  })
  async createPlan(
    @Body() data: CreateItemRequest[],
    @Param('eventId') eventId: string,
    @GetUser() user: string,
  ): Promise<string> {
    return this.itemsService.createEventPlan(data, eventId, JSON.parse(user));
  }

  @Post('/upload-csv')
  @ApiConsumes('multipart/form-data')
  @Public()
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
}
