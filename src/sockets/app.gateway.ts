import { PagerMiddleware } from './../middleware/pagerMiddleware';
import { JwtService } from '@nestjs/jwt';
import { Logger, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SocketEnum } from "src/common/enum/socket.enum";
import { jwtConstants } from 'src/config/jwt.config';
import { UserService } from 'src/modules/user/user.service';
import { PayloadUser } from 'src/modules/user/dto/user.response';
import { WsGuard } from 'src/guards/ws.guard';

@UseGuards(WsGuard)
@WebSocketGateway(3006, { cors: true })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;

    private logger: Logger = new Logger('MesageGateway')

    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) { }

    afterInit(server: Server): void {
        this.logger.log('Socket initialization');
    }

    handleConnection(@ConnectedSocket() client: Socket): void {
        this.logger.log(`${client.id} connect`)
        client.emit(SocketEnum.CONNECT_SUCCESS, 'Connect success')
    }

    async handleDisconnect(client: Socket): Promise<void> {
        this.logger.log(`${client.id} disconnect`)
        try {
            const accessToken = client.handshake.auth.accessToken
            if (Boolean(accessToken)) {
                const decode = this.jwtService.verify(
                    client.handshake.auth.accessToken, {
                    secret: jwtConstants.accessTokenSecret,
                }
                )
                const user = await this.userService.findById(decode.id)
                if (!Boolean(user)) {
                    throw new WsException("User not found")
                }
            }
        } catch (err) {
            this.logger.error(err)
        }
    }

    @SubscribeMessage('hello')
    async hello(@ConnectedSocket() client: Socket): Promise<void> {
        client.emit('hahaha', 'hello')
    }

    //bắn vào một event comment
    //comment bao gồm: text, taskId 
    //lưu vào db cái comment
    //emit lại danh sách comment của task đó sort theo desc createdAt


}