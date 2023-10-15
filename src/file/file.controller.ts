import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { ApiTags, ApiBody, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { FileRequest } from './dto/file.request';

@Controller('file')
@ApiTags('File Upload')
@ApiBearerAuth()
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Post('/upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        folderName: {
          type: 'enum',
          enum: ['event', 'comment', 'avatar', 'task'],
          default: 'avatar',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile('file') file: Express.Multer.File,
    @Body('folderName') folderName: string,
  ): Promise<string | undefined> {
    const fileDto = plainToInstance(FileRequest, {
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      fileBuffer: file.buffer,
    });
    const downloadUrl = await this.fileService.uploadFile(fileDto, folderName);
    return downloadUrl;
  }
}
