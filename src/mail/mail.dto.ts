import { AutoMap } from '@automapper/classes';

export class MailDTO {
  @AutoMap()
  public id: number;

  @AutoMap()
  public mailTitle: string;

  @AutoMap()
  public mailText: string;
}
