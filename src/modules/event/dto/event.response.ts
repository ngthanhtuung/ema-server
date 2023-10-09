import { Expose } from 'class-transformer';
import { EEventStatus } from 'src/common/enum/enum';

export class EventResponse {
  @Expose()
  id: string;

  @Expose()
  eventName: string;

  @Expose()
  description: string;

  @Expose()
  coverUrl: string;

  @Expose()
  startDate: string;

  @Expose()
  endDate: string;

  @Expose()
  location: string;

  @Expose()
  estBudget: string;

  @Expose()
  status: EEventStatus;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;
}
