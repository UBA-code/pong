import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { Chat } from './entities/chat.entity';
import { ChatController } from './chat.controller';
import { ChannelMsgs } from './entities/channelmsgs.entity';
import { Channel } from './entities/channel.entity';
import { Friendship } from 'src/user/entities/friendship.entity';
import { friendshipService } from 'src/user/friendship.service';
import { UserGatewayModule } from 'src/user/user.gateway.module';
import { UserGateway } from 'src/user/user.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Chat, ChannelMsgs, Channel, Friendship]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    UserGatewayModule,
  ],
  providers: [
    ChatGateway,
    ChatService,
    UserService,
    AuthService,
    friendshipService,
  ],
  controllers: [ChatController],
})
export class ChatModule {}
