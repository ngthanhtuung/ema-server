/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketEnum } from 'src/common/enum/socket.enum';
import { jwtConstants } from 'src/config/jwt.config';
import { UserService } from 'src/modules/user/user.service';
import { WsGuard } from 'src/guards/ws.guard';
import { NotificationService } from 'src/modules/notification/notification.service';

@UseGuards(WsGuard)
@WebSocketGateway(3006, {
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  protected logger: Logger = new Logger('MesageGateway');

  constructor(
    protected readonly jwtService: JwtService,
    protected readonly userService: UserService,
    protected readonly notificationService: NotificationService,
  ) {}

  afterInit(server: Server): void {
    this.logger.log('Socket initialization');
    console.log('server:', server);
  }

  //function get user from token
  async getDataUserFromToken(client: Socket): Promise<string> {
    const accessToken: any = client.handshake.auth.access_token;
    try {
      const decoded = this.jwtService.verify(accessToken, {
        secret: jwtConstants.accessTokenSecret,
      });
      console.log('decoded:', decoded);

      return decoded; // response to function
    } catch (ex) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    this.logger.log(`${client.id} connect`);
    try {
      const token: any = await this.getDataUserFromToken(client);
      // Save data cliendID in database
      await this.userService.insertSocketId(token.id, client.id);
      client.emit(SocketEnum.CONNECT_SUCCESS, 'Connect success');
    } catch (error) {
      return error.message;
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.log(`${client.id} disconnect`);
    try {
      const token: any = await this.getDataUserFromToken(client);
      await this.userService.insertSocketId(token.id, null);
    } catch (error) {
      return error.message;
    }
  }

  @SubscribeMessage('hello')
  async hello(@ConnectedSocket() client: Socket): Promise<void> {
    client.emit('hahaha', 'Test thử nè má ơi');
  }
}
