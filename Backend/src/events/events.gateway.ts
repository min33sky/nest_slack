import { onlineMap } from './onlineMap';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'; //? 원본 socket.io까지 설치를 해줘야 타입체크가 작동한다.
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: /\/ws-.+/,
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger(EventsGateway.name);

  //? express에서 app.set('io')을 라우터에서 가져올 때 쓰는 방식
  @WebSocketServer() public server: Server;

  // 기존 socket.io의 on메서드와 동일하게 작동한다.
  @SubscribeMessage('test')
  handleTest(@MessageBody() data: string) {
    this.logger.debug('Socket.IO TEST: ', data);
  }

  @SubscribeMessage('login')
  handleLogin(
    @MessageBody() data: { id: number; channels: number[] },
    @ConnectedSocket() socket: Socket,
  ) {
    const newNamespace = socket.nsp;
    this.logger.debug(`LOGIN to namespace: ${newNamespace}`);
    onlineMap[socket.nsp.name][socket.id] = data.id;
    //* 접속한 소켓들에 onlineList 이벤트 발생
    newNamespace.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));
    data.channels.forEach((channel) => {
      console.log('join', socket.nsp.name, channel);
      socket.join(`${socket.nsp.name}-${channel}`);
    });
  }

  @SubscribeMessage('dm')
  handleDM(
    @MessageBody() data: { id: number; content: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const result = Object.keys(onlineMap[socket.nsp.name]).find(
      (key) => onlineMap[socket.nsp.name][key] === data.id,
    );
    this.logger.debug('[DM보내기!!!!!!!]: ', result);
    // if (result) {
    //   socket.to(result).emit('dm', '시ㅣㅣㅣㅣㅣㅣㅣㅣ발');
    // }
  }

  afterInit(server: Server) {
    this.logger.log('websocket server init');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.debug(`[connected]: ${socket.nsp.name}`);
    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = {};
    }
    // broadcast to all clients in the given sub-namespace
    socket.emit('hello', socket.nsp.name);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.debug(`[disconnected]: ${socket.nsp.name}`);
    const newNamespace = socket.nsp;
    delete onlineMap[socket.nsp.name][socket.id];
    newNamespace.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));
  }
}

// namespace -> room
// workspace -> channel/dm
