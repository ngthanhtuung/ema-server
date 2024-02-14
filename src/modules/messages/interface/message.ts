import {
  CreateMessageParams,
  CreateMessageResponse,
  DeleteMessageParams,
  EditMessageParams,
} from 'src/utils/types';
import { MessageEntity } from '../messages.entity';
import { MessagesPagination } from '../dtos/messages.pagination';
import { IPaginateResponse } from 'src/modules/base/filter.pagination';

export interface IMessageService {
  createMessage(params: CreateMessageParams): Promise<CreateMessageResponse>;
  getMessages(
    id: string,
    messagesPagination: MessagesPagination,
  ): Promise<IPaginateResponse<MessageEntity[]>>;
  deleteMessage(params: DeleteMessageParams);
  editMessage(params: EditMessageParams): Promise<MessageEntity>;
}
