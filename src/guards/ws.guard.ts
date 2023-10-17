import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { Observable } from 'rxjs';
import { UserService } from 'src/modules/user/user.service';
import { PayloadUser } from 'src/modules/user/dto/user.response';
import { jwtConstants } from 'src/config/jwt.config';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(
    context: ExecutionContext,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<boolean | Promise<boolean> | Observable<boolean> | any> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const accessToken: string =
      client.handshake.auth['accessToken'].split(' ')[1];
    try {
      const decoded: PayloadUser = await this.jwtService.verify(accessToken, {
        secret: jwtConstants.accessTokenSecret,
      });

      const user = await this.userService.findById(decoded.id);
      if (!Boolean(user)) {
        throw new WsException('User not found');
      }
      context.switchToWs().getData().user = user;
      return Boolean(user);
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
