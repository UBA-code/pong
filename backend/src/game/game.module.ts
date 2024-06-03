import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Chat } from 'src/chat/entities/chat.entity';
import { JwtModule } from '@nestjs/jwt';
import { Friendship } from 'src/user/entities/friendship.entity';
import { ChannelMsgs } from 'src/chat/entities/channelmsgs.entity';
import { Channel } from 'src/chat/entities/channel.entity';
import { friendshipService } from 'src/user/friendship.service';
import { UserGateway } from 'src/user/user.gateway';
import { Scope } from '@nestjs/common';
import { Match } from 'src/match/entities/match.entity';
import { GameController } from './game.controller';
import { Notification } from 'src/user/entities/notifications.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Friendship,
      Chat,
      ChannelMsgs,
      Channel,
      Match,
      Notification,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [GameService, GameGateway, GameController, UserGateway],
  controllers: [GameController],
})
export class GameModule {}
