import { Injectable } from '@nestjs/common';
import { DbChatDto } from './dto/db-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { UserService } from 'src/user/user.service';
import { Channel } from './entities/channel.entity';
import { ChannelMsgs } from './entities/channelmsgs.entity';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { alertProp, notificationType } from 'src/user/enums/enums';
import { promisify } from 'util';
import { promises } from 'dns';

const scrypt = promisify(_scrypt);

interface mutedUser {
  userId: number;
  channelId: number;
  muteTime: number;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    @InjectRepository(Channel) private channelRepository: Repository<Channel>,
    @InjectRepository(ChannelMsgs)
    private ChannelMsgsRepository: Repository<ChannelMsgs>,
    private userService: UserService,
  ) {
    this.superviseMutedUsers();
  }

  private readonly mutedUsers = new Set<mutedUser>();

  superviseMutedUsers() {
    this.channelRepository.find({ relations: ['muted'] }).then((channels) => {
      channels.forEach((channel) => {
        channel.muted.forEach((user) => {
          this.unmuteUserFromServer(channel.id, user.id);
        });
      });
    });
    setInterval(() => {
      this.mutedUsers.forEach((user) => {
        user.muteTime -= 1;
        if (user.muteTime === 0) {
          this.unmuteUserFromServer(user.channelId, user.userId);
          console.log(
            'User ',
            user.userId,
            ' unmuted from channel ',
            user.channelId,
          );
          this.mutedUsers.delete(user);
        }
        // else
        //   console.log(
        //     'User',
        //     user.userId,
        //     'still muted for',
        //     user.muteTime,
        //     'seconds',
        //   );
      });
    }, 1000);
  }

  create(DbChatDto: DbChatDto) {
    // console.log('DbChatDto', DbChatDto);
    const dm = this.chatRepository.create(DbChatDto);
    // console.log('dm : ', dm);
    return this.chatRepository.save(dm);
  }

  async findOne(id: number): Promise<Channel> {
    return await this.channelRepository.findOne({
      where: { id },
      relations: ['createdBy', 'admins', 'users', 'banned', 'muted'],
    });
  }

  async resetChat() {
    await this.chatRepository.clear();
  }

  async getDm(id1: number, id2: number, index: number) {
    const chat = await this.chatRepository.find({
      where: [
        { from: { id: id1 }, to: { id: id2 } },
        { from: { id: id2 }, to: { id: id1 } },
      ],
      order: {
        createdAt: 'ASC',
      },
      relations: ['from', 'to'],
    });

    if (index >= chat.length) return [];
    const filtred = chat
      .reverse()
      .slice(index, index + 50)
      .reverse()
      .map((c) => {
        return {
          id: c.id,
          message: c.message,
          from: c.from.username,
          to: c.to.username,
          createdAt: c.createdAt,
          seen: c.seen,
        };
      });
    return filtred;
  }

  async deleteChat(user1Id: number, user2Id: number) {
    // method 1
    await this.chatRepository.delete({
      from: { id: user1Id },
      to: { id: user2Id },
    });
    await this.chatRepository.delete({
      from: { id: user2Id },
      to: { id: user1Id },
    });
    // method 2
    // this one needs to load the chat first and then remove it from the db with the remove method
    // const chat = await this.chatRepository.find({
    //   where: [
    //     { from: { id: user1Id }, to: { id: user2Id } },
    //     { from: { id: user2Id }, to: { id: user1Id } },
    //   ],
    // });
    // await this.chatRepository.remove(chat);
  }

  async checkChannelUsersAddingElegibility(
    channelId: number,
    userId: number,
    User: any,
  ) {
    console.log(
      'someone is trying to join a channel with another id',
      userId,
      User.id,
    );
    const channel = await this.findOne(channelId);
    if (!channel)
      return {
        alertContent: 'channel not found',
        color: 'danger',
      };
    if (!channel.admins.map((admin) => admin.id).includes(User.id))
      return {
        alertContent:
          'You are not an allowed user to add someone to this channel',
        color: 'danger',
      };

    const blockedByIds = await this.userService
      .findOneByIdWithBlocked(User.id)
      .then((u) => {
        return u?.blockedBy.map((user) => user.id);
      });
    if (!blockedByIds.includes(userId))
      return {
        alertContent: 'success',
        color: 'success',
      };
  }

  async checkChannelUsersKickingElegibility(
    channelId: number,
    userId: number,
    User: any,
  ) {
    console.log(
      'someone is trying to kick someone else from a channel',
      userId,
      User.id,
    );
    const channel = await this.findOne(channelId);
    if (!channel)
      return {
        alertContent: 'channel not found',
        color: 'danger',
      };
    if (!channel.admins.map((admin) => admin.id).includes(User.id))
      return {
        alertContent:
          'You are not an allowed user to kick someone from this channel',
        color: 'danger',
      };

    return {
      alertContent: 'success',
      color: 'success',
    };
  }

  async resetDm(id1: number, id2: number) {
    const chat = await this.chatRepository.find({
      where: [
        { from: { id: id1 }, to: { id: id2 } },
        { from: { id: id2 }, to: { id: id1 } },
      ],
    });
    await this.chatRepository.remove(chat);
    return 'Chat reseted';
  }

  async getLastMessage(id1: number, id2: number) {
    const chat = await this.chatRepository.find({
      where: [
        { from: { id: id1 }, to: { id: id2 } },
        { from: { id: id2 }, to: { id: id1 } },
      ],
      order: {
        createdAt: 'DESC',
      },
      take: 1,
      relations: ['from', 'to'],
    });

    const filtred = chat.map((c) => {
      return {
        id: c.id,
        message: c.message,
        from: c.from.username,
        to: c.to.username,
        createdAt: c.createdAt,
      };
    });

    return filtred;
  }

  async createDm(id1: number, id2: number, message: string) {
    const from = await this.userService.findOneByIdWithFriends(id1);
    const to = await this.userService.findOneByIdWithFriends(id2);
    // check if the users are friends
    if (!from.friends.find((f) => f.id === to.id)) {
      // console.log('You are not friends');
      return -1;
    }

    if (message.length > 255) return 'MAX_LENGHT_EXEEDED';

    const chat = this.chatRepository.create({
      from,
      to,
      message,
    });
    await this.chatRepository.save(chat);
    return chat.id;
  }

  async createChannel(body: any) {
    const channel = new Channel();

    console.log('body', body);
    channel.createdBy = body.createdBy;
    channel.name = body.name;
    channel.type = body.type;
    channel.avatar = body.avatar;
    channel.password = body.password;

    console.log('channel to save', channel);
    await this.channelRepository.save(channel);
    let joined;
    if (channel.type === 'protected')
      joined = await this.joinChannel(
        channel.id,
        body.createdBy,
        body.password,
      );
    else joined = await this.joinChannel(channel.id, body.createdBy);
    if (joined.color !== 'success')
      return {
        alertContent: `Failed to create channel ${channel.name}, Error : ${joined.alertContent}`,
        color: 'danger',
      };
    const admined = await this.adminify(
      channel.id,
      body.createdBy,
      body.createdBy,
      1,
    );
    if (admined.color !== 'success')
      return {
        alertContent: `Failed to create channel ${channel.name}, Error : ${admined.alertContent}`,
        color: 'danger',
      };
    return {
      alertContent: `Successfully created channel ${channel.name}`,
      color: 'success',
    };
  }

  unlinkOldAvatar(path: string) {
    const fs = require('fs');
    if (path) {
      fs.unlink(`./${path}`, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
  }

  async updateChannel(id: number, body: any): Promise<alertProp> {
    const channel = await this.channelRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!channel)
      return {
        alertContent: 'Channel not found',
        color: notificationType.danger,
      };
    if (channel.createdBy.id !== body.createdBy)
      return {
        alertContent: 'You are not allowed to update this channel',
        color: notificationType.danger,
      };
    if (body.name) channel.name = body.name;
    if (body.password) channel.password = body.password;
    if (body.type) channel.type = body.type;
    if (body.avatar) {
      this.unlinkOldAvatar(channel.avatar);
      channel.avatar = body.avatar;
    }
    await this.channelRepository.save(channel);
    return {
      alertContent: `Successfully updated channel ${channel.name}`,
      color: notificationType.success,
    };
  }

  async joinChannel(
    channelId: number,
    userId: number,
    password?: string,
    addedByAdmin?: boolean,
  ) {
    if (!userId)
      return { alertContent: 'User id is required', color: 'danger' };
    if (!channelId)
      return { alertContent: 'Channel id is required', color: 'danger' };
    const user = await this.userService.findOneById(userId);
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['users', 'banned'],
    });
    if (!channel) return { alertContent: 'Channel not found', color: 'danger' };
    if (!user) return { alertContent: 'User not found', color: 'danger' };
    if (channel.banned.find((u) => u.id === user.id))
      return {
        alertContent: 'You are banned from this channel',
        color: 'danger',
      };
    if (channel.users.find((u) => u.id === user.id))
      return { alertContent: 'User already joined', color: 'danger' };
    if (channel.type === 'protected') {
      if (channel.password !== password)
        return { alertContent: 'Wrong password', color: 'danger' };
    }
    channel.users.push(user);
    await this.channelRepository.save(channel);
    if (addedByAdmin) return 'admin added user to channel';
    return {
      alertContent: `Successfully joined channel ${channel.name}`,
      color: 'success',
    };
  }

  async leaveChannel(channelId: number, userId: number) {
    if (!userId)
      return { alertContent: 'User id is required', color: 'danger' };
    if (!channelId)
      return { alertContent: 'Channel id is required', color: 'danger' };
    const user = await this.userService.findOneById(userId);
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['users', 'admins', 'createdBy'],
    });
    if (!channel) return { alertContent: 'Channel not found', color: 'danger' };
    if (!user) return { alertContent: 'User not found', color: 'danger' };
    if (!channel.users.find((u) => u.id === user.id))
      return { alertContent: 'User not joined', color: 'danger' };
    if (channel.createdBy.id == userId)
      try {
        return await this.deleteChannelAfterOwnerQuit(channelId);
      } catch (e) {
        return {
          alertContent: `Error: ${e.message}`,
          color: 'danger',
        };
      }
    channel.users = channel.users.filter((u) => u.id !== user.id);
    channel.admins = channel.admins.filter((u) => u.id !== user.id);
    await this.channelRepository.save(channel);
    return {
      alertContent: `Successfully left channel ${channel.name}`,
      color: 'success',
    };
  }

  async infoChannel(id: number) {
    const { password, ...channel } = await this.channelRepository.findOne({
      where: { id },
      relations: ['users', 'admins', 'banned', 'muted', 'createdBy'],
    });
    if (!channel) return { alertContent: 'Channel not found', color: 'danger' };
    // channel.users = channel.users.map((u) => u.id) as any;
    // channel.admins = channel.admins.map((u) => u.id) as any;
    // channel.banned = channel.banned.map((u) => u.id) as any;
    // channel.muted = channel.muted.map((u) => u.id) as any;
    // channel.createdBy = channel.createdBy?.id as any;
    const ret = channel.users.map((u) => {
      return {
        id: u.id,
        username: u.username,
        displayname: u.displayname,
        avatar: u.avatar,
        isMuted: channel.muted.find((m) => m.id === u.id) ? true : false,
        isAdmin: channel.admins.find((a) => a.id === u.id) ? true : false,
        isBanned: false,
        isCreator: channel.createdBy.id === u.id ? true : false,
      };
    });
    const bannedWithBool = channel.banned.map((m) => {
      return { ...m, isBanned: true };
    });
    return {
      id: channel.id,
      name: channel.name,
      avatar: channel.avatar,
      type: channel.type,
      users: ret,
      admins: channel.admins,
      banned: channel.banned,
      muted: channel.muted,
      allUsers: [...ret, ...bannedWithBool],
      createdBy: channel.createdBy,
    };
  }

  async adminify(
    channelId: number,
    userId: number,
    adminId: number,
    flag: number = 0,
  ) {
    if (!userId)
      return { alertContent: 'User id is required', color: 'danger' };
    if (!channelId)
      return { alertContent: 'Channel id is required', color: 'danger' };
    const user = await this.userService.findOneById(userId);
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['admins', 'users'],
    });
    if (flag === 0 && !channel.admins.find((u) => u.id === adminId))
      return {
        alertContent: 'You are not allowed to adminify',
        color: 'danger',
      };
    if (!channel) return { alertContent: 'Channel not found', color: 'danger' };
    if (!user) return { alertContent: 'User not found', color: 'danger' };
    if (channel.admins.find((u) => u.id === user.id))
      return this.unadminify(channelId, userId, adminId);
    // console.log(channel.users.find((u) => u.id === user.id));
    if (!channel.users.find((u) => u.id === user.id)) channel.users.push(user);
    channel.admins.push(user);
    await this.channelRepository.save(channel);
    return {
      alertContent: `Successfully Set ${user.username} as Admin in channel ${channel.name}`,
      color: 'success',
    };
  }

  async moveOwnership(channelId: number, userId: number, adminId: number) {
    if (!userId)
      return {
        alertContent: 'User id is required',
        color: 'danger',
      };
    if (!channelId)
      return {
        alertContent: 'Channel id is required',
        color: 'danger',
      };
    const user = await this.userService.findOneById(userId);
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['admins', 'createdBy'],
    });
    if (!channel) return { alertContent: 'Channel not found', color: 'danger' };
    if (!user) return { alertContent: 'User not found', color: 'danger' };
    if (!channel.admins.find((u) => u.id === channel.createdBy.id))
      return {
        alertContent: 'Only owner can be move the ownership of the channel',
        color: 'danger',
      };
    if (!channel.admins.find((u) => u.id === user.id))
      return {
        alertContent: `${user.username} must be an admin to take ownership`,
        color: 'danger',
      };
    channel.createdBy = user;
    await this.channelRepository.save(channel);
    return {
      alertContent: `Successfully moved ownership to ${user.username} in channel ${channel.name}`,
      color: 'success',
    };
  }

  async unadminify(channelId: number, userId: number, adminId: number) {
    if (!userId)
      return { alertContent: 'User id is required', color: 'danger' };
    if (!channelId)
      return { alertContent: 'Channel id is required', color: 'danger' };
    const user = await this.userService.findOneById(userId);
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['admins', 'createdBy'],
    });
    if (!channel) return { alertContent: 'Channel not found', color: 'danger' };
    if (!user) return { alertContent: 'User not found', color: 'danger' };
    if (!channel.admins.find((u) => u.id === adminId))
      return {
        alertContent: 'You are not allowed to unadminify',
        color: 'danger',
      };
    if (!channel.admins.find((u) => u.id === user.id))
      return { alertContent: 'User is not admin', color: 'danger' };
    if (channel.createdBy.id === userId)
      return {
        alertContent:
          'LOL did you just tried to remove admin from the owner ???',
        color: 'danger',
      };
    channel.admins = channel.admins.filter((u) => u.id !== user.id);
    await this.channelRepository.save(channel);
    return {
      alertContent: `Successfully Removed Admin from ${user.username}`,
      color: 'success',
    };
  }

  async kickUser(channelId: number, userId: number, adminId: number) {
    if (!userId)
      return { alertContent: 'User id is required', color: 'danger' };
    if (!channelId)
      return { alertContent: 'Channel id is required', color: 'danger' };
    const user = await this.userService.findOneById(userId);
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['users', 'admins', 'createdBy'],
    });
    if (!channel) return { alertContent: 'Channel not found', color: 'danger' };
    if (!user) return { alertContent: 'User not found', color: 'danger' };
    if (!channel.admins.find((u) => u.id === adminId))
      return { alertContent: 'You are not allowed to kick', color: 'danger' };
    if (
      channel.admins.find((u) => u.id === user.id) &&
      channel.createdBy.id !== adminId
    )
      return { alertContent: 'You cannot kick an admin', color: 'danger' };
    if (!channel.users.find((u) => u.id === user.id))
      return {
        alertContent: 'User is not in this channel',
        color: 'danger',
      };
    channel.users = channel.users.filter((u) => u.id !== user.id);
    channel.admins = channel.admins.filter((u) => u.id !== user.id);
    await this.channelRepository.save(channel);
    return {
      alertContent: `Successfully kicked ${user.username} from channel ${channel.name}`,
      color: 'success',
      user: {
        alertContent: `You have been kicked from channel ${channel.name}`,
        color: 'danger',
      },
    };
  }

  async banUser(channelId: number, userId: number, adminId: number) {
    if (!userId)
      return { alertContent: 'User id is required', color: 'danger' };
    if (!channelId)
      return { alertContent: 'Channel id is required', color: 'danger' };
    const user = await this.userService.findOneById(userId);
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['banned', 'users', 'admins', 'createdBy'],
    });
    if (!channel) return { alertContent: 'Channel not found', color: 'danger' };
    if (!user) return { alertContent: 'User not found', color: 'danger' };
    if (!channel.admins.find((u) => u.id === adminId))
      return { alertContent: 'You are not allowed to ban', color: 'danger' };
    if (
      channel.admins.find((u) => u.id === user.id) &&
      channel.createdBy.id !== adminId
    )
      return { alertContent: 'You cannot ban an admin', color: 'danger' };
    if (channel.banned.find((u) => u.id === user.id))
      return { alertContent: 'User already banned', color: 'danger' };
    channel.banned.push(user);
    channel.users = channel.users.filter((u) => u.id !== user.id);
    channel.admins = channel.admins.filter((u) => u.id !== user.id);
    await this.channelRepository.save(channel);
    return {
      alertContent: `Successfully banned ${user.username} from channel ${channel.name}`,
      color: 'success',
      user: {
        alertContent: `You have been banned from channel ${channel.name}`,
        color: 'danger',
      },
    };
  }

  async unbanUser(channelId: number, userId: number, adminId: number) {
    if (!userId)
      return { alertContent: 'User id is required', color: 'danger' };
    if (!channelId)
      return { alertContent: 'Channel id is required', color: 'danger' };
    const user = await this.userService.findOneById(userId);
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['banned'],
    });
    if (!channel) return { alertContent: 'Channel not found', color: 'danger' };
    if (!user) return { alertContent: 'User not found', color: 'danger' };
    if (!channel.banned.find((u) => u.id === user.id))
      return {
        alertContent: `User ${user.username} is not banned from channel ${channel.name}`,
        color: 'success',
      };
    channel.banned = channel.banned.filter((u) => u.id !== user.id);
    await this.channelRepository.save(channel);
    return {
      alertContent: `Successfully unbanned ${user.username} from channel ${channel.name}`,
      color: 'success',
    };
  }

  async muteUser(
    channelId: number,
    userId: number,
    adminId: number,
    time: number,
  ) {
    if (!userId)
      return { alertContent: 'User id is required', color: 'danger' };
    if (!channelId)
      return { alertContent: 'Channel id is required', color: 'danger' };
    const user = await this.userService.findOneById(userId);
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['muted', 'users', 'admins', 'createdBy'],
    });
    if (!channel) return { alertContent: 'Channel not found', color: 'danger' };
    if (!user) return { alertContent: 'User not found', color: 'danger' };
    // console.log(`${channel.name} admins are :`);
    // console.log(channel.admins);
    if (!channel.admins.find((u) => u.id === adminId))
      return { alertContent: 'You are not allowed to mute', color: 'danger' };

    // console.log('created by:', channel.createdBy.id);
    // console.log('user id:', user.id);
    // console.log('created by:', channel.createdBy.username);
    if (
      channel.admins.find((u) => u.id === user.id) &&
      channel.createdBy.id !== adminId
    )
      return { alertContent: 'You cannot mute an admin', color: 'danger' };
    if (!channel.users.find((u) => u.id === user.id))
      return { alertContent: 'User is not in this channel', color: 'danger' };
    if (channel.muted.find((u) => u.id === user.id))
      return { alertContent: 'User already muted', color: 'danger' };
    channel.muted.push(user);
    await this.channelRepository.save(channel);
    if (time > 0) this.mutedUsers.add({ userId, channelId, muteTime: time });
    return {
      alertContent: `Successfully muted ${user.username} from channel ${channel.name}`,
      color: 'success',
    };
  }

  async isMuted(channelId: number, username: string) {
    const user = await this.userService.findOneByusername(username);
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['muted'],
    });
    if (!channel) return { alertContent: 'Channel not found', color: 'danger' };
    if (!user) return { alertContent: 'User not found', color: 'danger' };
    if (channel.muted.find((u) => u.id === user.id)) {
      // console.log(user.username, 'is muted in channel ', channel.name);
      return true;
    }
    // console.log(user.username, 'is not muted in channel ', channel.name);
    return false;
  }

  async unmuteUserFromServer(channelId: number, userId: number) {
    if (!userId) return 'User id is required';
    if (!channelId)
      return { alertContent: 'Channel id is required', color: 'danger' };
    const user = await this.userService.findOneById(userId);
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['muted'],
    });
    if (!channel) return { alertContent: 'Channel not found', color: 'danger' };
    if (!user) return { alertContent: 'User not found', color: 'danger' };
    if (!channel.muted.find((u) => u.id === user.id)) return 'User not muted';
    channel.muted = channel.muted.filter((u) => u.id !== user.id);
    await this.channelRepository.save(channel);
    return {
      alertContent: `Successfully unmuted ${user.username}`,
      color: 'success',
    };
  }

  async unmuteUser(channelId: number, userId: number, adminId: number) {
    if (!userId)
      return { alertContent: 'User id is required', color: 'danger' };
    if (!channelId)
      return { alertContent: 'Channel id is required', color: 'danger' };
    const user = await this.userService.findOneById(userId);
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['muted', 'users', 'admins'],
    });
    if (!channel) return { alertContent: 'Channel not found', color: 'danger' };
    if (!user) return { alertContent: 'User not found', color: 'danger' };
    if (!channel.admins.find((u) => u.id === adminId))
      return { alertContent: 'You are not allowed to unmute', color: 'danger' };
    if (!channel.users.find((u) => u.id === user.id))
      return { alertContent: 'User is not in this channel', color: 'danger' };
    if (!channel.muted.find((u) => u.id === user.id))
      return { alertContent: 'User is not muted', color: 'danger' };
    channel.muted = channel.muted.filter((u) => u.id !== user.id);
    await this.channelRepository.save(channel);
    this.mutedUsers.forEach((m) => {
      if (m.userId === user.id && m.channelId === channelId) {
        this.mutedUsers.delete(m);
        console.log('User ', user.id, ' unmuted from channel ', channelId);
      }
    });
    return {
      alertContent: `Successfully unmuted ${user.username}`,
      color: 'success',
    };
  }

  async deleteChannel(id: number, adminId: number) {
    const channel = await this.channelRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!channel) return { alertContent: 'Channel not found', color: 'danger' };
    if (channel.createdBy.id !== adminId)
      return {
        alertContent:
          'You are not allowed to delete this channel only the creator can do it',
        color: 'danger',
      };
    await this.channelRepository.remove(channel);
    return { alertContent: 'Channel deleted', color: 'success' };
  }

  async deleteChannelMsgs(id: number) {
    await this.ChannelMsgsRepository.delete({ channel: { id } });
  }

  async deleteChannelAfterOwnerQuit(id: number) {
    const channel = await this.channelRepository.findOne({
      where: { id },
    });
    if (!channel) return { alertContent: 'Channel not found', color: 'danger' };

    console.log(`deleting channel : ${channel.name}`);
    await this.deleteChannelMsgs(channel.id);
    await this.channelRepository.remove(channel);
    console.log(`deleted channel : ${channel.name} successfully`);
    return {
      alertContent:
        "The Channel is Deleted since you're the owner and you quit",
      color: 'success',
    };
  }

  async sendMsgToChannel(channelId: number, userId: number, message: string) {
    const user = await this.userService.findOneById(userId);
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['users', 'muted'],
    });
    if (!channel) return { alertContent: 'Channel not found', color: 'danger' };
    if (!user) return { alertContent: 'User not found', color: 'danger' };
    if (!channel.users.find((u) => u.id === user.id))
      return { alertContent: 'You are not in this channel', color: 'danger' };
    if (channel.muted?.find((u) => u.id === user.id)) {
      const muteTime = Array.from(this.mutedUsers).find(
        (u) => u.userId === user.id && u.channelId === channelId,
      )?.muteTime;

      let alertContent;
      if (muteTime)
        alertContent =
          'You are muted for ' +
          this.secondsToHms(muteTime) +
          ', you cannot send messages to this channel';
      else
        alertContent =
          'You are muted permanently, you cannot send messages to this channel';
      return {
        alertContent,
        color: 'danger',
      };
    }
    // console.log('message sent');
    const chat = this.ChannelMsgsRepository.create({
      message,
      from: user,
      channel,
    });
    await this.ChannelMsgsRepository.save(chat);
    return chat.id;
  }

  async getChannelMsgs(channelId: number) {
    const channel = await this.ChannelMsgsRepository.find({
      where: { channel: { id: channelId } },
      relations: ['from'],
    });
    if (!channel) return 'Channel not found';
    const filtred = channel.map((c) => {
      return {
        messageId: c.id,
        from: {
          username: c.from.username,
          avatar: c.from.avatar,
        },
        message: c.message,
        createdAt: c.createdAt,
      };
    });
    return filtred;
  }

  // async getChannelMsgsWithoutBlock(
  //   channelId: number,
  //   username: string,
  //   index: number,
  // ) {
  //   const channelMsgs = await this.ChannelMsgsRepository.find({
  //     relations: ['from', 'seenBy'],
  //     where: { channel: { id: channelId } },
  //   });
  //   if (!channelMsgs) return 'Channel not found';
  //   if (index >= channelMsgs.length) return [];
  //   const user = await this.userService.findOneByusernameWithBlocked(username);
  //   const blockedUsernames = user?.blocked
  //     ? user.blocked.map((user) => user.username)
  //     : [];
  //   const blockedByUsernames = user?.blockedBy
  //     ? user.blockedBy.map((user) => user.username)
  //     : [];

  //   const filtredChannelMsgs = channelMsgs
  //     .map((c) => {
  //       return {
  //         messageId: c.id,
  //         from: {
  //           username: c.from.username,
  //           avatar: c.from.avatar,
  //         },
  //         message: c.message,
  //         createdAt: c.createdAt,
  //         seenBy: c.seenBy,
  //       };
  //     })
  //     .filter((message) => {
  //       return !blockedUsernames.includes(message.from.username);
  //     })
  //     .filter((message) => {
  //       return !blockedByUsernames.includes(message.from.username);
  //     });

  //   if (index >= filtredChannelMsgs.length) return [];
  //   else {
  //     const updatedMessages = [];

  //     for (const channelMessage of filtredChannelMsgs) {
  //       if (
  //         !channelMessage.seenBy.some((seenByUser) => user.id === seenByUser.id)
  //       ) {
  //         channelMessage.seenBy.push(user);
  //         const seenMsg = channelMsgs.find(
  //           (msg) => msg.id === channelMessage.messageId,
  //         );
  //         seenMsg.seenBy = channelMessage.seenBy;
  //         updatedMessages.push(seenMsg);
  //       }
  //     }

  //     // Use a transaction to update the seenBy field for multiple messages
  //     await this.ChannelMsgsRepository.manager.transaction(
  //       async (transactionalEntityManager) => {
  //         for (const msg of updatedMessages) {
  //           try {
  //             await transactionalEntityManager.save(msg);
  //           } catch (e) {
  //             console.log(
  //               'exception while updating the messages.seenBy:',
  //               e.message,
  //             );
  //           }
  //         }
  //       },
  //     );

  //     const ret = filtredChannelMsgs
  //       .sort((a, b) => a.messageId - b.messageId)
  //       .reverse()
  //       .slice(index, index + 50)
  //       .reverse();
  //     return ret;
  //   }
  // }

  async getChannelMsgsWithoutBlock(
    channelId: number,
    username: string,
    index: number,
  ) {
    const channelMsgs = await this.ChannelMsgsRepository.find({
      relations: ['from', 'seenBy'],
      where: { channel: { id: channelId } },
    });
    // console.log(username, 'seen messages of channel id', channelId);
    if (!channelMsgs) return 'Channel not found';
    if (index >= channelMsgs.length) return [];
    const user = await this.userService.findOneByusernameWithBlocked(username);
    const blockedUsernames = user?.blocked
      ? user.blocked.map((user) => user.username)
      : [];
    const blockedByUsernames = user?.blockedBy
      ? user.blockedBy.map((user) => user.username)
      : [];
    // console.log('blockedUsernames', blockedUsernames);
    // console.log('blockedByUsernames', blockedByUsernames);
    const filtredChannelMsgs = channelMsgs
      .map((c) => {
        return {
          messageId: c.id,
          from: {
            username: c.from.username,
            avatar: c.from.avatar,
          },
          message: c.message,
          createdAt: c.createdAt,
          seenBy: c.seenBy,
        };
      })
      .filter((message) => {
        return !blockedUsernames.includes(message.from.username);
      })
      .filter((message) => {
        return !blockedByUsernames.includes(message.from.username);
      });

    if (index >= filtredChannelMsgs.length) return [];
    else {
      filtredChannelMsgs.forEach(async (channelMessage) => {
        // console.log(
        //   message.message,
        //   'is already seen by',
        //   message.seenBy.map((u) => u.username),
        // );
        if (
          !channelMessage.seenBy.some((seenByUser) => user.id === seenByUser.id)
        ) {
          channelMessage.seenBy.push(user);
          try {
            let seenMsg = channelMsgs.find(
              (msg) => msg.id === channelMessage.messageId,
            );
            seenMsg.seenBy = channelMessage.seenBy;
            await this.ChannelMsgsRepository.save(seenMsg);
          } catch (e) {
            console.log(
              'exception while updating the messages.seenBy:',
              e.message,
            );
          }
          // console.log(message.message, 'just seen by', user.username);
        }
      });
      const ret = filtredChannelMsgs
        .sort((a, b) => a.messageId - b.messageId)
        .reverse()
        .slice(index, index + 50)
        .reverse();
      return ret;
    }
  }

  async getPublicChannels() {
    const channels = await this.channelRepository.find({
      where: [{ type: 'public' }, { type: 'protected' }],
      relations: ['users', 'admins', 'banned', 'muted', 'createdBy'],
    });
    return channels;
  }

  seen(senderId: number, receiverId: number) {
    const messagesBetween = this.chatRepository.find({
      where: [{ from: { id: senderId }, to: { id: receiverId } }],
      relations: ['from', 'to'],
    });

    messagesBetween.then((msgs) => {
      msgs.forEach((msg) => {
        msg.seen = true;
        this.chatRepository.save(msg);
      });
    });

    return 'Done';
  }

  secondsToHms(d: number) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor((d % 3600) % 60);

    const hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : '';
    const mDisplay = m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : '';
    const sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '';
    return hDisplay + mDisplay + sDisplay;
  }

  seenByUsername(senderUsername: string, receiverUsername: string) {
    console.log('senderUsername : ', senderUsername);
    console.log('receiverUsername : ', receiverUsername);
    const messagesBetween = this.chatRepository.find({
      where: [
        {
          from: { username: senderUsername },
          to: { username: receiverUsername },
        },
      ],
      relations: ['from', 'to'],
    });

    messagesBetween.then((msgs) => {
      msgs.forEach((msg) => {
        if (msg.to.username === receiverUsername) {
          msg.seen = true;
          this.chatRepository.save(msg);
        }
      });
    });

    return 'Done';
  }

  unseenNbr(senderId: number, receiverId: number) {
    const messagesBetween = this.chatRepository.find({
      where: [{ from: { id: senderId }, to: { id: receiverId } }],
      relations: ['from', 'to'],
    });

    const numberOfUnseen = messagesBetween.then((msgs) => {
      return msgs.filter((msg) => !msg.seen).length;
    });

    return numberOfUnseen;
  }

  lastMessageSenderId(senderId: number, receiverId: number) {
    const messagesBetween = this.chatRepository.find({
      where: [
        { from: { id: senderId }, to: { id: receiverId } },
        { from: { id: receiverId }, to: { id: senderId } },
      ],
      relations: ['from', 'to'],
    });

    if (messagesBetween) {
      return messagesBetween.then((msgs) => {
        const lastMsg = msgs[msgs.length - 1];
        if (!lastMsg) return 'No messages';
        return lastMsg.from.id;
      });
    }
    // return 'No messages';
  }
}
