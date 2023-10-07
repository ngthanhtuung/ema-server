import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { EventEntity } from './event.entity';

@Injectable()
export class EventService extends BaseService<EventEntity> {}
