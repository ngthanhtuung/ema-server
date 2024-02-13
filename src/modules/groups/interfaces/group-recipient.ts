import {
  AddGroupRecipientParams,
  AddGroupUserResponse,
  CheckUserGroupParams,
  LeaveGroupParams,
  RemoveGroupRecipientParams,
  RemoveGroupUserResponse,
} from 'src/utils/types';
import { GroupsEntity } from '../groups.entity';

export interface IGroupRecipientService {
  addGroupRecipient(
    params: AddGroupRecipientParams,
  ): Promise<AddGroupUserResponse>;
  removeGroupRecipient(
    params: RemoveGroupRecipientParams,
  ): Promise<RemoveGroupUserResponse>;
  leaveGroup(params: LeaveGroupParams);
  isUserInGroup(params: CheckUserGroupParams): Promise<GroupsEntity>;
}
