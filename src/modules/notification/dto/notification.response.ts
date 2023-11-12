import { Expose } from 'class-transformer';
import { ETypeNotification } from 'src/common/enum/enum';

export class NotificationResponse {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  type: ETypeNotification;

  @Expose()
  readFlag: boolean;

  @Expose()
  sender: string;

  @Expose()
  avatar: string;

  @Expose()
  createdAt: Date;
}
