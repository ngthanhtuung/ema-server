import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AccessParams,
  CreateGroupParams,
  FetchGroupsParams,
} from '../../utils/types';
import { GroupsEntity } from './groups.entity';
import { UserEntity } from '../user/user.entity';
import { GroupNotFoundException } from './exception/GroupNotFound';
import { IGroupService } from './interfaces/group';
import { UserService } from '../user/user.service';

@Injectable()
export class GroupsService implements IGroupService {
  constructor(
    @InjectRepository(GroupsEntity)
    private readonly groupRepository: Repository<GroupsEntity>,
    private readonly userService: UserService,
  ) {}

  async createGroup(params: CreateGroupParams): Promise<string> {
    const { creator, title } = params;
    const usersPromise = params.users.map((email) =>
      this.userService.findUser(email),
    );
    const users = (await Promise.all(usersPromise)).filter((user) => user);
    users.push(creator);
    const groupParams = { owner: creator, users, creator, title };
    const group = this.groupRepository.create(groupParams);
    this.groupRepository.save(group);
    return 'Create group successfully';
  }

  getGroups(params: FetchGroupsParams): Promise<GroupsEntity[]> {
    return this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.users', 'user')
      .where('user.id IN (:users)', { users: [params.userId] })
      .leftJoinAndSelect('group.users', 'users')
      .leftJoinAndSelect('group.creator', 'creator')
      .leftJoinAndSelect('group.owner', 'owner')
      .leftJoinAndSelect('group.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('users.profile', 'usersProfile')
      .leftJoinAndSelect('users.presence', 'usersPresence')
      .orderBy('group.lastMessageSentAt', 'DESC')
      .getMany();
  }

  findGroupById(id: string): Promise<GroupsEntity> {
    return this.groupRepository.findOne({
      where: { id },
      relations: [
        'creator',
        'users',
        'lastMessageSent',
        'owner',
        'users.profile',
        'users.presence',
      ],
    });
  }

  saveGroup(group: GroupsEntity): Promise<GroupsEntity> {
    return this.groupRepository.save(group);
  }

  async hasAccess({
    id,
    userId,
  }: AccessParams): Promise<UserEntity | undefined> {
    const group = await this.findGroupById(id);
    if (!group) throw new GroupNotFoundException();
    return group.users.find((user) => user.id === userId);
  }

  //   async transferGroupOwner({
  //     userId,
  //     groupId,
  //     newOwnerId,
  //   }: TransferOwnerParams): Promise<GroupsEntity> {
  //     const group = await this.findGroupById(groupId);
  //     if (!group) throw new GroupNotFoundException();
  //     if (group.owner.id !== userId)
  //       throw new GroupOwnerTransferException('Insufficient Permissions');
  //     if (group.owner.id === newOwnerId)
  //       throw new GroupOwnerTransferException(
  //         'Cannot Transfer Owner to yourself',
  //       );
  //     const newOwner = await this.userService.findUser({ id: newOwnerId });
  //     if (!newOwner) throw new UserNotFoundException();
  //     group.owner = newOwner;
  //     return this.groupRepository.save(group);
  //   }

  //   async updateDetails(params: UpdateGroupDetailsParams): Promise<GroupsEntity> {
  //     const group = await this.findGroupById(params.id);
  //     if (!group) throw new GroupNotFoundException();
  //     if (params.avatar) {
  //       const key = generateUUIDV4();
  //       await this.imageStorageService.upload({ key, file: params.avatar });
  //       group.avatar = key;
  //     }
  //     group.title = params.title ?? group.title;
  //     return this.groupRepository.save(group);
  //   }
}
