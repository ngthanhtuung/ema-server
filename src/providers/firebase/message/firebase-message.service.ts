import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FirebaseNotificationRequest } from './dto/firebase-notification.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseMessageService {
  async sendCustomNotificationFirebase(
    notification: FirebaseNotificationRequest,
  ): Promise<unknown | undefined> {
    try {
      const deviceTokenArray = notification.deviceToken;
      let result = null;
      result = admin.messaging().sendEachForMulticast({
        tokens: deviceTokenArray,
        notification: {
          title: notification.title,
          body: notification.body,
        },
      });
      return result;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
