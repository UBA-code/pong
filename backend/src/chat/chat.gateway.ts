import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { CreateDmDto, MessageChannelDto } from './dto/create-chat.dto';
import { User } from 'src/user/entities/user.entity';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  namespace: 'chat',
})
export class ChatGateway {
  constructor(
    private userService: UserService,
    private AuthService: AuthService,
    private chatService: ChatService,
  ) {}

  private readonly userSocketMap = new Map<string, number>();

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token?.jwt;
      if (!token) {
        console.log('no token for chat socket:', token);
        return;
      }
      // ! check if the token is valid
      this.AuthService.getUser(token).then((user) => {
        if (!user) {
          console.log("jwt is invalid, user can't be connected to chat");
          return;
        }
        // console.log('user connected : ', user.username);
        this.userSocketMap.set(client.id, user.id);
        console.log('connected users to chat: ', this.userSocketMap);
      });
    } catch (error) {
      console.log('error', error);
    }
  }

  async handleDisconnect(client: Socket) {
    const userDisconnected = await this.userService.findOneById(
      this.userSocketMap.get(client.id),
    );
    // console.log('user disconnected from chat : ', userDisconnected?.username);
    this.userSocketMap.delete(client.id);
    // console.log('connected users in chat : ', this.userSocketMap);
  }

  @SubscribeMessage('identity')
  handleIdentity(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ): void {
    console.log(`Client ${client.id} is authenticated as user ${userId}`);
  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    messageObj,
  ): Promise<void> {
    const toUser: User = await this.userService.findOneByusername(
      messageObj.to,
    );

    const fromUser: User = await this.userService.findOneByusername(
      messageObj.senderUserName,
    );

    if (!toUser) {
      console.log('User not found');
      return;
    }

    const recievers = Array.from(this.userSocketMap.keys()).filter(
      (key) => this.userSocketMap.get(key) === toUser.id, // retrieve the user from the map based on it's id lihowa lkey dlmap
    );

    if (!recievers) {
      console.log('User', toUser.username, 'is not connected');
      return;
    }
    recievers.forEach(async (reciever) => {
      client.to(reciever).emit('privateMessage', messageObj);
      // console.log(
      //   messageObj.senderUserName,
      //   'sent',
      //   messageObj.content,
      //   'to',
      //   messageObj.to,
      //   'in socket',
      //   reciever,
      // );
      // ! here
    });
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    typingObj,
  ): Promise<void> {
    const toUser: User = await this.userService.findOneById(typingObj.to);

    if (!toUser) {
      console.log('User not found');
      return;
    }

    const recievers = Array.from(this.userSocketMap.keys()).filter(
      (key) => this.userSocketMap.get(key) === toUser.id, // retrieve the user from the map based on it's id lihowa lkey dlmap
    );

    if (!recievers) {
      console.log(
        'User',
        toUser.username,
        "is not connected can't recieve typing status",
      );
      return;
    }
    recievers.forEach(async (reciever) => {
      client.to(reciever).emit('typing', typingObj);
    });
  }

  @SubscribeMessage('channelMessage')
  async handleChannelMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    messageObj,
  ): Promise<void> {
    const channel = await this.chatService.infoChannel(messageObj.to);
    if (typeof channel === 'string')
      return console.log('Channel not found', channel);
    if (!channel) {
      console.log('Channel not found');
      return;
    }
    const user = await this.userService.findOneByusernameWithBlocked(
      messageObj.senderUserName,
    );
    const blockedIds = user?.blocked ? user.blocked.map((user) => user.id) : [];
    const blockedByIds = user?.blockedBy
      ? user.blockedBy.map((user) => user.id)
      : [];
    // console.log('user.blocked', user?.blocked);
    // console.log('user.blockedBy', user?.blockedBy);
    // console.log('blockedIds', blockedIds);
    // console.log('blockedByIds', blockedByIds);

    const recieversIds: number[] = channel.users
      .filter((user) => {
        return !blockedIds.includes(user.id);
      })
      .filter((user) => {
        return !blockedByIds.includes(user.id);
      })
      .map((user) => user.id);

    // console.log('recieversIds', recieversIds);
    const connectedRecievers = Array.from(this.userSocketMap.keys())
      .filter((key) => recieversIds.includes(this.userSocketMap.get(key))) // keep just connected ones
      .filter((reciever) => reciever !== client.id); // except him self ofc
    connectedRecievers.forEach((reciever) => {
      client.to(reciever.toString()).emit('channelMessage', messageObj);
    });
  }
}
