import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
// import { createUserDto } from './dtos/createUser.dto';
import { UserService } from './user.service';
import { friendshipService } from './friendship.service';
import { ChatService } from 'src/chat/chat.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { UserReq } from './decorators/user.decorator';
import { User } from './entities/user.entity';
import { Infos } from './dtos/updateUserInfos.dto';

export interface infos {
  birthday: Date;
  sex: 'MALE' | 'FEMALE';
  socialMedia: {
    x: string;
    facebook: string;
  };
}

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private userService: UserService,
    private friendshipService: friendshipService,
    private chatService: ChatService,
  ) {
    this.userService.deconnectAllUsers();
    this.userService.createBotAccount();
  }
  @Get('exist')
  async getAllUsers(@Query('username') username: string) {
    return await this.userService
      .findOneByusername(username)
      .then((user) => (user ? true : false));
  }

  @Post(':username/update/username')
  async updateDisplayname(
    @Body('username') newUsername: string,
    @Param('username') username: string,
    @UserReq({ param: 'username' }) User,
  ) {
    const user = await this.userService.updateDisplayname(
      username,
      newUsername,
    );
    if (!user) return { message: 'Username already exists' };
    console.log(`${user.username} changed his username to ${newUsername}`);
    return { message: 'Success' };
  }

  @Post(':username/upload/avatar')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/test',
        filename: (req, file, cb) => {
          const username = req.params.username;
          const random = Math.floor(Math.random() * 1000000);
          if (file.mimetype !== 'image/png') {
            console.log('the file is not png');
            console.log('file : ', file.mimeType);
            return cb(null, 'error');
          }
          cb(null, `${username}-${random}-avatar.png`);
        },
      }),
    }),
  )
  uploadFile(
    @UploadedFile() file,
    @Param('username') username: string,
    @UserReq({ param: 'username' }) User,
  ) {
    // console.log('New avatar uploaded : ', file);
    if (file.filename === 'error') {
      const fs = require('fs');
      fs.unlinkSync(file.path);
      return { message: 'The file should be in PNG format', color: 'danger' };
    }
    if (file.size > 1024 * 1024 * 5) {
      const fs = require('fs');
      fs.unlinkSync(file.path);
      return {
        message: 'Image size must be at most 5MB',
        color: 'danger',
      };
    }
    this.userService.updateAvatar(username, file.path);
    return { message: 'Avatar updated successfully', color: 'success' };
  }

  @Get('leaderboard/top/:username')
  async getLeaderboard(
    @Query('x', ParseIntPipe) x: number,
    @Param('username') username: string,
  ) {
    return await this.userService
      .getLeaderboard(x, username)
      .then((u) => {
        if (x !== -1) return u.slice(0, x);
        return u;
      })
      .then((ret) => {
        return ret.filter((user) => {
          return !user.username.includes('bot');
        });
      });
  }

  @Get('matches/history/:username')
  async getUserMatches(
    @Param('username') username: string,
    @Query('x') x: number,
    @Query('index') index: number,
  ) {
    const result = await this.userService.findUsernameMatches(username);
    if (result.length === 0) return [];
    if (x === undefined) {
      if (index === undefined) return result.reverse();
      return result.reverse().slice(index, index + 20);
    }
    result.reverse();
    return result.slice(0, x);
  }

  @Get('matches/longeststreak/:username')
  getLongestStreak(@Param('username') username: string) {
    return this.userService.getLongestStreak(username);
  }

  @Get('matches/winrate/:username')
  getWinrate(@Param('username') username: string) {
    return this.userService.getWinrate(username);
  }

  @Get('matches/lastmatch/:username')
  getLastMatch(@Param('username') username: string) {
    return this.userService.getLastMatch(username);
  }

  @Get('xmatches/:username')
  clearUserMatches(@Param('username') username: string) {
    const user = this.userService.clearUsernameMatches(username);
    return 'Matches cleared successfully';
  }

  @Get(':username/chats')
  getUserChats(@Param('username') username: string) {
    const user = this.userService.findUsernameChats(username);
    return user;
  }

  @Get('waiting/approuval')
  async waitingMyApprouval(@UserReq() User) {
    const waiting = await this.friendshipService.getWaitingApprouvalFriendships(
      User.id,
    );

    const result = await Promise.all(
      waiting.map(async (user) => {
        const sender = await this.userService.findOneById(user.sentBy);
        return {
          displayname: sender.displayname,
          username: sender.username,
          avatar: sender.avatar,
        };
      }),
    );
    return result;
  }

  @Get('sent/requests')
  async sentRequests(@UserReq() User) {
    const pendingReq = await this.friendshipService.sentRequests(User.id);
    const result = await Promise.all(
      pendingReq.map(async (user) => {
        const targetId = user.user1Id === User.id ? user.user2Id : user.user1Id;
        const pender = await this.userService.findOneById(targetId);
        return {
          displayname: pender.displayname,
          username: pender.username,
          avatar: pender.avatar,
        };
      }),
    );
    return result;
  }

  @Get('friendships/:id')
  async getUserFriendships(
    @Param('id', ParseIntPipe) id: number,
    @UserReq({ param: 'id' }) User,
  ) {
    const user = await this.friendshipService.getFriendships(id);
    let users = [];
    for (let i = 0; i < user.length; i++) {
      users.push(
        await this.userService
          .findOneById(
            user[i].user1Id === id ? user[i].user2Id : user[i].user1Id,
          )
          .then((user) => {
            return {
              id: user.id,
              username: user.username,
              displayname: user.displayname,
              avatar: user.avatar,
              status: user.status,
            };
          }),
      );
    }

    for (let i = 0; i < users.length; i++) {
      users[i].lastMessage = await this.chatService.getLastMessage(
        id,
        users[i].id,
      );
      const lastMessageTimeToNow =
        new Date().getTime() -
        new Date(users[i].lastMessage[0]?.createdAt).getTime();
      users[i] = { ...users[i], lastMessageTimeToNow };
      const seconds = Math.floor(lastMessageTimeToNow / 1000);
      const minutes = Math.floor(lastMessageTimeToNow / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);
      const years = Math.floor(months / 12);
      if (years > 0) {
        users[i].lastMessageDate = years + 'y';
      } else if (months > 0) {
        users[i].lastMessageDate = months + 'm';
      } else if (days > 0) {
        users[i].lastMessageDate = days + 'd';
      } else if (hours > 0) {
        users[i].lastMessageDate = hours + 'h';
      } else if (minutes > 0) {
        users[i].lastMessageDate = minutes + 'm';
      } else {
        users[i].lastMessageDate = 'Now';
      }

      if (users[i].lastMessage.length > 0)
        users[i].lastMessage = users[i].lastMessage[0].message;
      else {
        users[i].lastMessage = 'Say hi to ' + users[i].username;
        users[i].lastMessageDate = users[i].lastMessage[0]?.createdAt;
      }
    }
    users.sort((a, b) => {
      return a.lastMessageTimeToNow - b.lastMessageTimeToNow;
    });

    for (let i = 0; i < users.length; i++) {
      users[i].unseenNumber = await this.chatService.unseenNbr(users[i].id, id);
      users[i].messagedLast = await this.chatService
        .lastMessageSenderId(users[i].id, id)
        .then((id) => {
          return users[i].id === id ? true : false;
        });
    }
    // console.log('users : ', users);
    return users;
  }

  @Get('blocked')
  async blockedUsers(@UserReq() User) {
    return await this.userService
      .findOneByusernameWithBlocked(User.username)
      .then((user) => {
        return user.blocked.map((user) => {
          return {
            username: user.username,
            displayname: user.displayname,
            avatar: user.avatar,
          };
        });
      });
  }

  @Post('update/infos')
  @UsePipes(new ValidationPipe())
  async updateInfos(@UserReq() User, @Body('data') data: Infos) {
    // console.log('recieved data:', data);
    // console.log('recieved user:', User);
    return this.userService.updateUserInfos(data, User.id);
  }

  @Get('friendships/:id/add/:friendId')
  async addFriendship(
    @Param('id') id: string,
    @Param('friendId') friendId: string,
    @Query('byUsername') byUsername: boolean,
    @UserReq() User,
  ) {
    if (byUsername) {
      this.userService.checkCookieUsername(User.username, id);
      const user = await this.userService.findOneByusername(id);
      const friend = await this.userService.findOneByusername(friendId);
      const friendship = await this.friendshipService.createFriendship(
        user.id,
        friend.id,
      );
      // console.log('friendship', friendship);
      return friendship;
    } else {
      this.userService.checkCookieId(User.id, parseInt(id));
      const friendship = await this.friendshipService.createFriendship(
        parseInt(id),
        parseInt(friendId),
      );
      // console.log('friendship', friendship);
      return friendship;
    }
  }

  @Get('friendships/:id/block/:friendId')
  async blockFriendship(
    @Param('id') id: string,
    @Param('friendId') friendId: string,
    @Query('byUsername') byUsername: boolean,
    @UserReq() User,
  ) {
    if (byUsername) {
      this.userService.checkCookieUsername(User.username, id);
      const user = await this.userService.findOneByusername(id);
      const friend = await this.userService.findOneByusername(friendId);
      return await this.userService.blockFriend(user.id, friend.id);
    } else {
      this.userService.checkCookieId(User.id, parseInt(id));
      return await this.userService.blockFriend(
        parseInt(id),
        parseInt(friendId),
      );
    }
  }

  @Get('friendships/:id/unblock/:friendId')
  async unBlockFriendship(
    @Param('id') id: string,
    @Param('friendId') friendId: string,
    @Query('byUsername') byUsername: boolean,
    @UserReq() User,
  ) {
    if (byUsername) {
      this.userService.checkCookieUsername(User.username, id);
      const user = await this.userService.findOneByusername(id);
      const friend = await this.userService.findOneByusername(friendId);
      return await this.userService.unBlockFriend(user.id, friend.id);
    } else {
      this.userService.checkCookieId(User.id, parseInt(id));
      return await this.userService.unBlockFriend(
        parseInt(id),
        parseInt(friendId),
      );
    }
  }

  @Get('friendships/:id/accept/:friendId')
  async acceptFriendship(
    @Param('id') id: string,
    @Param('friendId') friendId: string,
    @Query('byUsername') byUsername: boolean,
    @UserReq() User,
  ) {
    if (byUsername) {
      this.userService.checkCookieUsername(User.username, id);
      const user = await this.userService.findOneByusername(id);
      const friend = await this.userService.findOneByusername(friendId);
      const friendship = await this.friendshipService.acceptFriendship(
        user.id,
        friend.id,
      );
      return friendship;
    } else {
      this.userService.checkCookieId(User.id, parseInt(id));
      const friendship = await this.friendshipService.acceptFriendship(
        parseInt(id),
        parseInt(friendId),
      );
      return friendship;
    }
  }

  @Get('friendships/:id/remove/:friendId')
  async removeFriendship(
    @Param('id') id: string,
    @Param('friendId') friendId: string,
    @Query('byUsername') byUsername: boolean,
    @UserReq() User,
  ) {
    if (byUsername) {
      this.userService.checkCookieUsername(User.username, id);
      const user = await this.userService.findOneByusername(id);
      const friend = await this.userService.findOneByusername(friendId);
      const friendship = await this.friendshipService.removeFriendship(
        user.id,
        friend.id,
      );
      // delete the chat between the two users
      this.chatService.deleteChat(user.id, friend.id);
      return friendship;
    } else {
      this.userService.checkCookieId(User.id, parseInt(id));
      const friendship = await this.friendshipService.removeFriendship(
        parseInt(id),
        parseInt(friendId),
      );
      // delete the chat between the two users
      this.chatService.deleteChat(parseInt(id), parseInt(friendId));
      return friendship;
    }
  }

  @Get('non-joined-channels/:id')
  async getNonJoinedChannels(
    @Param('id', ParseIntPipe) id: number,
    @UserReq({ param: 'id' }) User,
  ) {
    const publicChannels = await this.chatService
      .getPublicChannels()
      .then((channel) => {
        return channel.map((channel) => {
          return {
            ...channel,
            joined: false,
            isBanned: false,
          };
        });
      });
    // add either the user is joined or not
    for (let i = 0; i < publicChannels.length; i++) {
      for (let j = 0; j < publicChannels[i].users.length; j++)
        if (publicChannels[i].users[j].id === id)
          publicChannels[i].joined = true;
      for (let j = 0; j < publicChannels[i].banned.length; j++)
        if (publicChannels[i].banned[j].id === id)
          publicChannels[i].isBanned = true;
    }

    const publicFilter = publicChannels
      .map((channel) => {
        return {
          id: channel.id,
          name: channel.name,
          avatar: channel.avatar,
          type: channel.type,
          joined: channel.joined,
          isBanned: channel.isBanned,
        };
      })
      .filter((channel) => {
        return channel.joined === false;
      })
      .filter((channel) => {
        return channel.isBanned === false;
      })
      .map((channel) => {
        return {
          id: channel.id,
          name: channel.name,
          avatar: channel.avatar,
          type: channel.type,
        };
      });

    return publicFilter;
  }

  @Get('joined-channels/:id')
  async getJoinedChannels(
    @Param('id', ParseIntPipe) id: number,
    @UserReq({ param: 'id' }) User,
  ) {
    const joinnedChannels = await this.userService.findOneByIdWithChannels(id);
    console.log('joined channels:', joinnedChannels);
    return joinnedChannels;
  }

  @Get('search/:username')
  async searchUser(
    @Req() req,
    @Query('search') search: string,
    @Param('username') username: string,
  ) {
    // console.log('the user :', req.user);
    const ret = await this.userService.searchUsers(
      search,
      username,
      req.user.id,
    );
    return ret;
  }

  @Get('is-friend/:username/:friendUsername')
  async isFriend(
    @Param('username') username: string,
    @Param('friendUsername') friendUsername: string,
    @UserReq({ param: 'username' }) User,
  ) {
    const ret = await this.friendshipService.isFriend(username, friendUsername);
    return ret;
  }

  @Get('friendship/:username/:friendUsername')
  async getFriendship(
    @Param('username') username: string,
    @Param('friendUsername') friendUsername: string,
    @UserReq({ param: 'username' }) User,
  ) {
    const user1 = await this.userService.findOneByusernameWithBlocked(username);
    const user2 =
      await this.userService.findOneByusernameWithBlocked(friendUsername);
    if (!user1 || !user2) return { message: 'User not found' };
    if (
      user1.blocked.find((u) => {
        return u.username === friendUsername;
      })
    )
      return 'BLOCKED';
    if (
      user1.blockedBy.find((u) => {
        return u.username === friendUsername;
      })
    )
      return 'BLOCKED_BY_HIM';
    const friendship = await this.friendshipService.getFriendship(
      user1.id,
      user2.id,
    );
    let status = 'NOT_FRIEND';
    if (friendship)
      status = friendship.accepted
        ? 'FRIEND'
        : friendship.sentBy == user1.id
          ? 'PENDING'
          : 'REQUESTED';
    return status;
  }
}
