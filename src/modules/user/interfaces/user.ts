import { FindUserOptions, FindUserParams } from 'src/utils/types';
import { UserEntity } from '../user.entity';

export interface IUserService {
  findUser(
    findUserParams: FindUserParams,
    options?: FindUserOptions,
  ): Promise<UserEntity>;
  searchUsers(query: string): Promise<UserEntity[]>;
}
