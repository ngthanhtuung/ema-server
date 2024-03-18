import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FirebaseNotificationRequest } from './dto/firebase-notification.dto';
import * as admin from 'firebase-admin';
import { DeviceService } from 'src/modules/device/device.service';

@Injectable()
export class FirebaseMessageService {
  constructor(private readonly deviceService: DeviceService) {}

  async sendCustomNotificationFirebase(
    notification: FirebaseNotificationRequest,
  ): Promise<unknown | undefined> {
    try {
      let result = null;
      if (notification.listUser.length > 0) {
        const listDeviceTokens = await this.deviceService.getListDeviceTokens(
          notification.listUser,
        );
        if (listDeviceTokens.length > 0) {
          result = admin.messaging().sendEachForMulticast({
            tokens: listDeviceTokens,
            notification: {
              title: notification.title,
              body: notification.body,
            },
          });
        }
      }

      return result;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
