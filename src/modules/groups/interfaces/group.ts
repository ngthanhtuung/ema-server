import { UserEntity } from 'src/modules/user/user.entity';
import { GroupsEntity } from 'src/modules/groups/groups.entity';
import {
  AccessParams,
  CreateGroupParams,
  FetchGroupsParams,
  TransferOwnerParams,
  UpdateGroupDetailsParams,
} from 'src/utils/types';

export interface IGroupService {
  createGroup(params: CreateGroupParams);
  getGroups(params: FetchGroupsParams): Promise<GroupsEntity[]>;
  findGroupById(id: string): Promise<GroupsEntity>;
  saveGroup(group: GroupsEntity): Promise<GroupsEntity>;
  hasAccess(params: AccessParams): Promise<UserEntity | undefined>;
  // transferGroupOwner(params: TransferOwnerParams): Promise<GroupsEntity>;
  // updateDetails(params: UpdateGroupDetailsParams): Promise<GroupsEntity>;
}
