import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { GameGateway } from './game.gateway';
import { UserReq } from 'src/user/decorators/user.decorator';
import { UserGateway } from 'src/user/user.gateway';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('game')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(
    private gameGateway: GameGateway,
    private userGateway: UserGateway,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  @Post('invite')
  async privateInvite(@Body() target, @UserReq() user) {
    const invite = {
      from: {
        id: user.id,
        username: user.username,
      },
      target: {
        id: target.id,
        username: target.username,
      },
    };
    const userSender = await this.userRepository.findOne({
      where: { id: user.id },
    });
    const notification = {
      username: userSender.username,
      displayname: userSender.displayname,
      avatar: userSender.avatar,
      type: 'Game invite',
      targetUsername: invite.from.username,
      targetId: invite.from.id,
      myUsername: invite.target.username,
      myId: invite.target.id,
    };

    this.userGateway.emmitToUser(target.id, 'ljaras', notification);
    this.userGateway.emmitToUser(target.id, 'notification', {
      alertContent: `${notification.displayname} want to play with you, have fun with him now!`,
      color: 'success',
    });
  }

  @Post('accept')
  async acceptedInvite(@Body() target, @UserReq() user) {
    console.log(user.username, 'accepted the game invite for:', target);
    const invite = {
      from: {
        id: user.id,
        username: user.username,
      },
      target: {
        id: target.id,
        username: target.username,
      },
    };
    const userSender = await this.userRepository.findOne({
      where: { id: user.id },
    });

    const notification = {
      username: userSender.username,
      displayname: userSender.displayname,
      avatar: userSender.avatar,
      type: 'Game invite accepted',
      targetUsername: invite.from.username,
      targetId: invite.from.id,
      myUsername: invite.target.username,
      myId: invite.target.id,
    };

    this.userGateway.emmitToUser(target.id, 'ljaras', notification);
    this.userGateway.emmitToUser(target.id, 'notification', {
      alertContent: `${notification.displayname} just accepted to play with you, enter the game now !`,
      color: 'success',
    });
  }
}
