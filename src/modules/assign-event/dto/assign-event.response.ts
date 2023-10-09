import { Expose } from 'class-transformer';

export class AssignEventResponse {
  @Expose()
  eventId: string;
}
