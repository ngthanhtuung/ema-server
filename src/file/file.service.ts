import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { FileRequest } from './dto/file.request';

@Injectable()
export class FileService {
  async uploadFile(
    data: FileRequest,
    folderName: string,
    customizeFileName?: string,
  ): Promise<object> {
    try {
      const errorMessage = await this.checkFileSize(10, data);
      if (errorMessage) {
        throw new BadRequestException(errorMessage);
      }
      const bucket = firebaseAdmin.storage().bucket();
      let uniqueFileName;
      if (!customizeFileName) {
        uniqueFileName = uuidv4();
      } else {
        uniqueFileName = customizeFileName;
      }
      const filePath = `${folderName}/${uniqueFileName}`;
      const file = bucket.file(filePath);
      await file.save(data.fileBuffer, {
        metadata: {
          contentType: data.fileType,
        },
      });
      const downloadUrl = await file.getSignedUrl({
        action: 'read',
        expires: '9999-01-01',
      });
      console.log('Donwload: ', downloadUrl);
      console.log('Unique filename: ', uniqueFileName);
      const fileDownload = {
        fileName: uniqueFileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        downloadUrl: downloadUrl[0],
      };
      return fileDownload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async checkFileSize(
    limitFileSize: number,
    fileCheck: FileRequest,
  ): Promise<string | boolean> {
    try {
      if (parseInt(fileCheck.fileSize) > limitFileSize * 1024 * 1024) {
        return `File size is too large, please try again with file size less than ${limitFileSize} MB`;
      }
    } catch (err) {
      return undefined;
    }
  }
}
