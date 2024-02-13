import { Socket } from 'socket.io';
import { UserEntity } from 'src/modules/user/user.entity';

export interface AuthenticatedSocket extends Socket {
  user?: UserEntity;
}
