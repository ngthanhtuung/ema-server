import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { messaging } from 'firebase-admin';
import { Messaging } from 'firebase-admin/lib/messaging/messaging';
import {
  BatchResponse,
  MessagingDevicesResponse,
  MessagingPayload,
  MulticastMessage,
} from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class FirebaseMessageService {
  async sendCustomNotification(
    registrationTokenOrTokens: string[],
    title: string,
    body: string,
    data: { [key: string]: string },
  ): Promise<BatchResponse> {
    try {
      const message: MulticastMessage = {
        tokens: registrationTokenOrTokens,
        data: data,
        notification: {
          title: title,
          body: body,
        },
      };
      return this.getMessaging().sendMulticast(message, true);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  getMessaging(): Messaging {
    return messaging();
  }
}
