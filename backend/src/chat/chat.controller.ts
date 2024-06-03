import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { Param, ParseIntPipe } from '@nestjs/common';
import { createChannelDto } from './dto/create-channel.dto';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { UserGateway } from 'src/user/user.gateway';
import { UserReq } from 'src/user/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';

const scrypt = promisify(_scrypt);
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private UserGateway: UserGateway,
  ) {}

  @Get()
  async getChat() {
    return 'Chat';
  }

  @Get('dm/:id1/:id2/:index')
  async getDm(
    @Param('id1', ParseIntPipe) id1: number,
    @Param('id2', ParseIntPipe) id2: number,
    @Param('index', ParseIntPipe) index: number,
  ): Promise<Chat[] | any> {
    const chat = await this.chatService.getDm(id1, id2, index);
    await this.chatService.seen(id2, id1);
    return chat;
  }

  @Post('dm/:id/:id2')
  async createDm(
    @Param('id', ParseIntPipe) id1: number,
    @Param('id2', ParseIntPipe) id2: number,
    @Body('message') message: string,
    @UserReq({ param: 'id' }) User,
  ): Promise<Chat | any> {
    if (id1 === id2) return 'You can not send message to yourself';
    if (!message) return 'Message can not be empty';
    if (message.length === 0) return 'Message can not be empty';

    return await this.chatService.createDm(id1, id2, message);
    // ! check if the user is connected and send the message to him by socket
  }

  @Get('reset/:id/:id2')
  async resetDm(
    @Param('id', ParseIntPipe) id1: number,
    @Param('id2', ParseIntPipe) id2: number,
    @UserReq({ param: 'id' }) User,
  ) {
    return this.chatService.resetDm(id1, id2);
  }

  passwordPolicy(password: string) {
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password.length > 30) return 'Password must be at most 30 characters';
    if (!password.match(/[a-zA-Z]/))
      return 'Password must contain at least one letter';
    if (!password.match(/[0-9]/))
      return 'Password must contain at least one number';
    if (!password.match(/[!@#$%^&*]/))
      return 'Password must contain at least one special character';
    if (password.match(/ /)) return 'Password must not contain spaces';
    if (password.match(/[^a-zA-Z0-9!@#$%^&*]/))
      return 'Password must contain only letters, numbers and special characters';
    return '';
  }

  @Post('channels/create')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/channels',
        filename: (req, file, cb) => {
          if (file.mimetype !== 'image/png') {
            console.log('the file is not png');
            console.log('file : ', file.mimeType);
            return cb(null, 'error');
          }
          const username = req.user.username;
          const random = Math.floor(Math.random() * 1000000);
          cb(null, `${random}-channel-avatar.png`);
        },
      }),
    }),
  )
  async createChannel(
    @UploadedFile() file,
    @Body() body: createChannelDto,
    @UserReq() User,
  ) {
    if (file) {
      if (file.filename === 'error') {
        return this.UserGateway.emmitToUser(User.id, 'notification', {
          alertContent: 'Please provide a png image',
          color: 'danger',
        });
      }
      // check file size
      if (file.size > 1024 * 1024 * 5) {
        return this.UserGateway.emmitToUser(User.id, 'notification', {
          alertContent: 'Image size must be at most 5MB',
          color: 'danger',
        });
      }
    }

    body = {
      ...body,
      id: parseInt(`${body.id}`),
      createdBy: parseInt(`${body.createdBy}`),
      avatar: file ? process.env.BACKEND_URL + '/' + file.path : undefined,
    };
    let notification;
    let notification1 = '';
    if (body.id === -1) {
      if (!body.createdBy) notification1 = 'User is required';
      if (!body.name) notification1 = 'Name is required';
      if (!body.type) notification1 = 'Type is required';
    }
    if (
      body.type !== 'public' &&
      body.type !== 'protected' &&
      body.type !== 'private'
    )
      notification1 = 'Type must be public or protected or private';
    if (body.type === 'protected') {
      console.log('body.password', body.password);
      if (!body.password && +body.id === -1) {
        notification1 = 'Please provide a password';
      } else if (body.password) {
        // notification1 = this.passwordPolicy(body.password);
        // console.log('notification1', notification1);
        // if (notification1 === '') {
        const salt = randomBytes(8).toString('hex');
        const hash = (await scrypt(body.password, salt, 32)) as Buffer;
        const result = salt + '.' + hash.toString('hex');
        body.password = result;
        // }
      }
    }
    if (notification1 !== '')
      return this.UserGateway.emmitToUser(body.createdBy, 'notification', {
        alertContent: notification1,
        color: 'danger',
      });
    if (+body.id === -1) {
      notification = await this.chatService.createChannel(body);
    } else notification = await this.chatService.updateChannel(body.id, body);
    return this.UserGateway.emmitToUser(
      body.createdBy,
      'notification',
      notification,
    );
  }

  @Post('channels/:channelId/add/:id')
  async joinChannel(
    @Param('channelId', ParseIntPipe) id: number,
    @Param('id', ParseIntPipe) userId: number,
    @Body('password') password: string,
    @UserReq() User,
  ) {
    let addedByAdmin = false;

    if (userId !== User.id) {
      const ret = await this.chatService.checkChannelUsersAddingElegibility(
        id,
        userId,
        User,
      );
      if (ret.alertContent !== 'success')
        return this.UserGateway.emmitToUser(User.id, 'notification', ret);
      addedByAdmin = true;
    }
    if (password) {
      const channelSalt = await this.chatService
        .findOne(id)
        .then((channel) => channel?.password?.split('.')[0]); // ! here
      const hash = (await scrypt(password, channelSalt, 32)) as Buffer;
      password = channelSalt + '.' + hash.toString('hex');
    }
    const ret = await this.chatService.joinChannel(
      id,
      userId,
      password,
      addedByAdmin,
    );
    if (ret === 'admin added user to channel') {
      const channel = await this.chatService.findOne(id);
      this.UserGateway.emmitToUser(userId, 'notification', {
        alertContent: `You have been added to ${channel.name} by ${User.username}, block him if you don't want to be added again`,
        color: 'success',
      });
    }
    return this.UserGateway.emmitToUser(userId, 'notification', ret);
  }

  @Get('channels/:channelId/remove/:userId')
  async leaveChannel(
    @Param('channelId', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @UserReq() User,
  ) {
    if (userId !== User.id) {
      // console.log('remove triggered by not user');
      const ret = await this.chatService.checkChannelUsersKickingElegibility(
        id,
        userId,
        User,
      );
      if (ret.alertContent !== 'success')
        return this.UserGateway.emmitToUser(User.id, 'notification', ret);
    }
    return await this.chatService.leaveChannel(id, userId);
    // return this.UserGateway.emmitToUser(userId, 'notification', ret);
  }

  @Get('channels/:channelId/ban/:userId')
  async banUser(
    @Param('channelId', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('adminId', ParseIntPipe) adminId: number,
    @UserReq() User,
  ) {
    let ret = await this.chatService.banUser(id, userId, User.id);
    this.UserGateway.emmitToUser(User.id, 'notification', ret);
    if (ret.alertContent.includes('Successfully banned')) {
      this.UserGateway.emmitToUser(userId, 'notification', ret.user);
    }
  }

  @Get('channels/:channelId/kick/:userId')
  async kickUser(
    @Param('channelId', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('adminId', ParseIntPipe) adminId: number,
    @UserReq() User,
  ) {
    const ret = await this.chatService.kickUser(id, userId, User.id);
    this.UserGateway.emmitToUser(User.id, 'notification', ret);
    if (ret.alertContent.includes('Successfully kicked'))
      this.UserGateway.emmitToUser(userId, 'notification', ret.user);
  }

  @Get('channels/:channelId/owner/:userId')
  async moveOwnership(
    @Param('channelId', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('adminId', ParseIntPipe) adminId: number,
    @UserReq() User,
  ) {
    const ret = await this.chatService.moveOwnership(id, userId, User.id);
    return this.UserGateway.emmitToUser(User.id, 'notification', ret);
  }

  @Get('channels/:channelId/unban/:userId')
  async unbanUser(
    @Param('channelId', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('adminId', ParseIntPipe) adminId: number,
    @UserReq() User,
  ) {
    const ret = await this.chatService.unbanUser(id, userId, User.id);
    return this.UserGateway.emmitToUser(User.id, 'notification', ret);
  }

  @Get('channels/:channelId')
  infoChannel(@Param('channelId', ParseIntPipe) id: number) {
    return this.chatService.infoChannel(id);
  }

  @Get('channels/:channelId/add-admin/:userId')
  async adminify(
    @Param('channelId', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('adminId', ParseIntPipe) adminId: number,
    @UserReq() User,
  ) {
    console.log(
      process.env.BACKEND_URL +
        '/chat/channels/' +
        id +
        '/add-admin/' +
        userId +
        '?adminId=' +
        adminId,
    );
    const ret = await this.chatService.adminify(id, userId, User.id);
    return this.UserGateway.emmitToUser(User.id, 'notification', ret);
  }

  @Get('channels/:channelId/remove-admin/:userId')
  async unadminify(
    @Param('channelId', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('adminId', ParseIntPipe) adminId: number,
    @UserReq() User,
  ) {
    const ret = await this.chatService.unadminify(id, userId, User.id);
    this.UserGateway.emmitToUser(User.id, 'notification', ret);
  }

  @Get('mutetest')
  mutetest() {
    // this.chatService.muteUser(1, 3, 2, 30);
    // this.chatService.muteUser(1, 4, 2, -1);
    this.chatService.muteUser(1, 1, 2, 60);
    console.log('mutetest');
    return 'mutetest';
  }

  @Get('channels/:channelId/mute/:userId')
  async muteUser(
    @Param('channelId', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('adminId', ParseIntPipe) adminId: number,
    @Query('time') time: number,
    @UserReq() User,
  ) {
    // console.log('id', id);
    // console.log('user id', userId);
    // console.log('admin id', adminId);
    // console.log('time', time);
    const ret = await this.chatService.muteUser(id, userId, User.id, time);
    console.log('notification : ', ret);
    this.UserGateway.emmitToUser(User.id, 'notification', ret);
  }

  @Get('channels/:channelId/unmute/:userId')
  async unmuteUser(
    @Param('channelId', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('adminId', ParseIntPipe) adminId: number,
    @UserReq() User,
  ) {
    const ret = await this.chatService.unmuteUser(id, userId, User.id);
    this.UserGateway.emmitToUser(User.id, 'notification', ret);
  }

  @Get('channels/:channelId/delete')
  async deleteChannel(
    @Param('channelId', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) adminId: number,
  ) {
    const ret = await this.chatService.deleteChannel(id, adminId); // ! check this after (awaiting...)
    this.UserGateway.emmitToUser(adminId, 'notification', ret);
  }

  @Post('channels/:id/:channelId')
  async sendMsgToChannel(
    @Param('channelId', ParseIntPipe) id: number,
    @Param('id', ParseIntPipe) userId: number,
    @Body('message') message: string,
  ) {
    if (message.length > 255)
      return this.UserGateway.emmitToUser(userId, 'notification', {
        alertContent: 'Message must be at most 255 characters',
        color: 'danger',
      });
    const ret = await this.chatService.sendMsgToChannel(id, userId, message);
    if (typeof ret === 'number') return ret;
    else this.UserGateway.emmitToUser(userId, 'notification', ret);
    return -1;
  }

  @Get('channels/:channelId/messages/:index')
  getChannelMsgsWithoutBlock(
    @Param('channelId', ParseIntPipe) id: number,
    @UserReq() User,
    @Param('index', ParseIntPipe) index: number,
  ) {
    // console.log('loading messages from index:', index, 'for:', User.username);
    return this.chatService.getChannelMsgsWithoutBlock(
      id,
      User.username,
      index,
    );
  }

  @Get('seen/:id/:senderId')
  seen(
    @Param('senderId', ParseIntPipe) senderId: number,
    @Param('id', ParseIntPipe) recieverId: number,
    @UserReq({ param: 'id' }) User,
  ) {
    return this.chatService.seen(senderId, recieverId);
  }

  @Get('seen/:recieverUsername/:senderUsername')
  seenByUsername(
    @Param('senderUsername') senderUsername: string,
    @Param('recieverUsername') recieverUsername: string,
  ) {
    return this.chatService.seenByUsername(senderUsername, recieverUsername);
  }

  @Get('unseen/:senderId/:recieverId')
  unseen(
    @Param('senderId', ParseIntPipe) senderId: number,
    @Param('recieverId', ParseIntPipe) recieverId: number,
  ) {
    return this.chatService.unseenNbr(senderId, recieverId);
  }
}
