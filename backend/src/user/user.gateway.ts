import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';
import { Notification } from './entities/notifications.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  // namespace: 'notify',
})
export class UserGateway {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Notification)
    private NotificationRepository: Repository<Notification>,
  ) {}

  private readonly onlineUsers = new Map<string, number>(); // userId to socketId

  @WebSocketServer()
  server: Server;

  async findOneByusername(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user?.username !== username) return undefined;
    return user;
  }

  async findOneById(id: number): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user?.id !== id) return undefined;
    return user;
  }

  async getUser(jwt: string) {
    if (!jwt) {
      console.log('no jwt');
      return null;
    }
    try {
      const payload = await this.jwtService.verify(jwt);
      const { password, ...user } = await this.findOneByusername(
        payload.username,
      );
      return user;
    } catch (e) {
      console.log('Got a NON_VALID jwt in / : ');
      return null;
    }
  }

  deleteCookiesEvent(client: Socket) {
    client.emit('deleteCookie', { cookieName: 'jwt' });
    client.emit('deleteCookie', { cookieName: 'refreshToken' });
    // console.log(
    //   'deleteCookie event has been sent \x1b[31mTHE FRONTEND SHOULD RECIEVE THE EVENT AND DELETE THE COOKIES !!!!\x1b[0m',
    // );
  }

  async handleConnection(client: Socket) {
    // console.log('client connected to / : ', client.id);
    try {
      const token = client.handshake.auth?.token?.jwt;
      // console.log('token in the usergateway : ', token);
      if (!token) {
        console.log('no token for user main socket:', token);
        this.deleteCookiesEvent(client);
        return;
      }
      // ! check if the token is valid
      this.getUser(token).then((user) => {
        if (!user) {
          console.log("jwt is invalid, user can't be connected");
          this.deleteCookiesEvent(client);
          return;
        }
        console.log('\x1b[32mUser Connected : \x1b[0m', user.username);
        this.onlineUsers.set(client.id, user.id);
        this.userRepository.update(user.id, { status: 'online' });
        console.log('online users : ', this.onlineUsers);
      });
    } catch (error) {
      console.log('error', error);
    }
  }

  handleDisconnect(client: any) {
    // console.log('client disconnected to / : ', client.id);
    this.onlineUsers.forEach((userId, socketId) => {
      if (socketId !== client.id) return;
      this.findOneById(userId).then((user) => {
        if (socketId === client.id) {
          console.log('\x1b[31mUser disconnected : \x1b[0m', user?.username);
          this.onlineUsers.delete(socketId);
          console.log('connected users : ', this.onlineUsers);
          let disconnected = true;
          for (const [socketId, id] of this.onlineUsers.entries()) {
            if (id === userId) {
              disconnected = false;
              break;
            }
          }
          if (disconnected)
            this.userRepository.update(userId, { status: 'offline' });
          return;
        }
      });
    });
  }

  async emmitToUser(userId: number, event: string, data: any) {
    const user = await this.findOneById(userId);
    if (!user) {
      console.log(
        `\x1b[31mUser with id ${userId} is not found in the database\x1b[0m`,
      );
      return data;
    }
    let loop = 0;
    let sent = false;
    for (const [socketId, id] of this.onlineUsers.entries()) {
      // entries() returns an array of [key, value] pairs for each element in the Map
      if (id === userId) {
        // console.log(
        //   'sending\x1b[32m',
        //   data,
        //   '\x1b[0m as a notification to : ',
        //   user?.username,
        // );
        // console.log('socketId : ', socketId);
        // console.log('event : ', event);
        this.server.to(socketId).emit(event, data);
        if (data.save) this.saveNotification(socketId, data);
        sent = true;
      }
      if (++loop === this.onlineUsers.size && !sent)
        console.log(
          `\x1b[31m${user?.username} is offline can't send ${event}:\x1b[0m`,
          data,
        );
    }
    return data;
  }

  saveNotification(socketId: string, data: any) {
    console.log(
      'Saving ' + data.save.type + ' notification for ' + data.save.username,
    );
    this.NotificationRepository.save({
      username: data.save.username,
      displayname: data.save.displayname,
      avatar: data.save.avatar,
      type: data.save.type,
      message: data.save.message,
      read: false,
    });
    this.server.to(socketId).emit('ljaras', data.save);
  }
}
