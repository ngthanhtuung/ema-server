import { GroupsMessageEntity } from 'src/modules/groups_messages/groups_messages.entity';
import {
  CreateGroupMessageParams,
  DeleteGroupMessageParams,
  EditGroupMessageParams,
} from 'src/utils/types';

export interface IGroupMessageService {
  createGroupMessage(params: CreateGroupMessageParams);
  getGroupMessages(id: number): Promise<GroupsMessageEntity[]>;
  deleteGroupMessage(params: DeleteGroupMessageParams);
  editGroupMessage(
    params: EditGroupMessageParams,
  ): Promise<GroupsMessageEntity>;
}
