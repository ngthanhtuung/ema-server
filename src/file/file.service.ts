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
  async uploadFile(data: FileRequest, folderName: string): Promise<object> {
    try {
      if (parseInt(data.fileSize) > 10 * 1024 * 1024) {
        throw new BadRequestException('File is less than 10MB');
      }
      const bucket = firebaseAdmin.storage().bucket();
      const uniqueFileName = uuidv4();
      const filePath = `${folderName}/${uniqueFileName}`;
      console.log('FilePath: ', filePath);
      const file = bucket.file(filePath);
      await file.save(data.fileBuffer, {
        metadata: {
          contentType: data.fileType,
        },
      });
      const downloadUrl = await file.getSignedUrl({
        action: 'read',
        expires: '2030-01-01',
      });
      console.log('Code is running here');
      const fileDownload = {
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        downloadUrl: downloadUrl[0],
      };
      return fileDownload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
