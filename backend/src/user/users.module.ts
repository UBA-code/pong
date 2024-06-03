import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './user.controller';
import { UserService } from './user.service';
import { Friendship } from './entities/friendship.entity';
import { friendshipService } from './friendship.service';
import { ChatService } from 'src/chat/chat.service';
import { Chat } from 'src/chat/entities/chat.entity';
import { ChannelMsgs } from 'src/chat/entities/channelmsgs.entity';
import { Channel } from 'src/chat/entities/channel.entity';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserGatewayModule } from './user.gateway.module';
import { Notification } from './entities/notifications.entity';
import { GameGateway } from 'src/game/game.gateway';
import { Match } from 'src/match/entities/match.entity';
import { GameService } from 'src/game/game.service';
import { UserGateway } from './user.gateway';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Friendship,
      Chat,
      ChannelMsgs,
      Channel,
      Notification,
      Match,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    UserGatewayModule,
  ],
  controllers: [UsersController],
  providers: [
    UserService,
    friendshipService,
    ChatService,
    AuthService,
    // UserGateway,
  ],
})
export class UsersModule {}
