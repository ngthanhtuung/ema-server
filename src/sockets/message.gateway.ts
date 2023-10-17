import { Injectable } from '@nestjs/common';
import { AppGateway } from './app.gateway';

@Injectable()
export class MessageGateway extends AppGateway {}
