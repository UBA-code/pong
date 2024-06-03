import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { createUserDto, createUserThirdPartyDto } from './dtos/createUser.dto';
import { friendshipService } from './friendship.service';
import { FriendshipStatus } from './enums/enums';
import { JwtService } from '@nestjs/jwt';
import { UserGateway } from './user.gateway';
import { UsersModule } from './users.module';
import { last } from 'rxjs';
import { Infos } from './dtos/updateUserInfos.dto';
import { channel } from 'diagnostics_channel';

interface LatestMatchObj {
  me: string;
  secondPlayerdisplayname: string;
  myScore: number;
  secondPlayerScore: number;
  winnerUsername: string;
  timesDefeatedByOpponent: number;
  timesWonAgainstOpponent: number;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private friendshipService: friendshipService,
    private userGateway: UserGateway,
  ) {}

  async getUser(jwt: string) {
    if (!jwt) {
      console.log('no jwt');
      return null;
    }
    try {
      const payload = await this.jwtService.verify(jwt);
      // console.log('payload is : ', payload);
      const { password, ...user } = await this.findOneByusername(
        payload.username,
      );
      return user;
    } catch (e) {
      return null;
    }
  }
  async findOneByusername(username: string): Promise<any | undefined> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user?.username !== username) return undefined;
    const { password, ...userWithoutPass } = user;
    return userWithoutPass;
  }

  async deconnectAllUsers() {
    const allUsers = await this.userRepository.find();
    allUsers.map((user) => {
      if (user.status == 'online') {
        console.log('disconnected', user.username);
        user.status = 'offline';
        this.userRepository.save(user);
      }
    });
  }

  async removeAllBots() {
    ['bot1', 'bot2', 'bot3'].map(async (botName) => {
      const bot = await this.findOneByusername(botName);
      if (bot) {
        await this.userRepository.delete(bot.id);
      }
    });
  }

  async createBotAccount() {
    ['bot1', 'bot2', 'bot3'].map(async (botName) => {
      if (await this.findOneByusername(botName)) return;
      const user = this.userRepository.create({
        username: botName,
        displayname:
          botName === 'bot1'
            ? '3allal'
            : botName === 'bot2'
              ? '3allal PRO'
              : '3allal PRO MAX',
        password: 'bot',
        email: `${botName}@bot.bot`,
        avatar: `${process.env.BACKEND_URL}/uploads/ranks/${botName}.png`,
      });
      await this.userRepository.save(user);
    });
  }

  async findOneByusernameWithBlocked(
    username: string,
  ): Promise<any | undefined> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['blocked', 'blockedBy'],
    });
    if (user?.username !== username) return undefined;
    const { password, ...userWithoutPass } = user;
    return userWithoutPass;
  }

  async findOneByIdWithBlocked(id: number): Promise<any | undefined> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['blocked', 'blockedBy'],
    });
    if (user?.id !== id) return undefined;
    const { password, ...userWithoutPass } = user;
    return userWithoutPass;
  }

  checkCookieUsername(cookieUsername: string, username: string) {
    if (cookieUsername === username) return;
    throw new Error(
      `Unauthorized because username ${cookieUsername} not match with request user ${username}`,
    );
  }

  checkCookieId(cookieId: number, id: number) {
    if (cookieId === id) return;
    throw new Error(
      `Unauthorized because id ${cookieId} not match with request id ${id}`,
    );
  }

  async findOneByDisplayname(displayname: string): Promise<any | undefined> {
    const user = await this.userRepository.findOne({
      where: { displayname },
    });
    if (user?.displayname !== displayname) return undefined;
    const { password, ...userWithoutPass } = user;
    return userWithoutPass;
  }

  async findOneById(id: number): Promise<any | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user?.id !== id) return undefined;
    const { password, ...userWithoutPass } = user;
    return userWithoutPass;
  }

  async findOneByIdWithFriends(id: number) {
    return await this.userRepository
      .findOne({
        where: { id },
        relations: ['friends'],
      })
      .then((u) => {
        const { password, ...userWithoutPass } = u;
        return userWithoutPass;
      });
  }

  calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // ila chher ba9i mawselch / chher d bday wsel ms nhar d bday ba9i mawslch
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  isValidFacebookLink(link: string): string {
    // Regular expression to match Facebook profile or page URLs
    // return link;
    const facebookRegex =
      /^(?:http(?:s)?:\/\/)?(?:www\.)?facebook\.com\/(?:profile\.php\?id=\d+|(?:[^\s\/?].*?\/)?(?:profile\.php\?id=\d+|pages\/[^\/?]+|people\/[^\/?]+|[^\/?]+))\/?$/;
    return facebookRegex.test(link) ? link : 'BAD_FORMAT';
  }

  isValidTwitterLink(link: string): string {
    // Regular expression to match Twitter profile URLs
    // return link;
    const twitterRegex =
      /^(?:http(?:s)?:\/\/)?(?:www\.)?x\.com\/([a-zA-Z0-9_]+)/;

    return twitterRegex.test(link) ? link : 'BAD_FORMAT';
  }

  checkDate(dateString: Date): string {
    const today = new Date();
    const date = new Date(dateString);
    // console.log('date is : ', date);
    // console.log('today is : ', today);
    if (typeof date !== 'object') return 'BAD_DATE';
    // console.log('date < today', date < today);
    return date < today ? date.toISOString().slice(0, 10) : 'BAD_DATE';
  }

  async updateUserInfos(data: Infos, id: number) {
    const user = await this.userRepository.findOneBy({ id });
    let oldAge = user.age;
    let oldCountry = user.country;
    let oldBirthday = user.birthday;
    let oldX = user.x;
    let oldFacebook = user.facebook;
    let oldSex = user.sex;

    const checkInputLength = (input, length) => {
      return input.length <= length;
    };

    if (!checkInputLength(data.country, 15))
      return this.userGateway.emmitToUser(id, 'notification', {
        alertContent: 'Country name too long',
        color: 'danger',
      });

    if (!checkInputLength(data.socialMedia.x, 100))
      return this.userGateway.emmitToUser(id, 'notification', {
        alertContent: 'X link too long',
        color: 'danger',
      });

    if (!checkInputLength(data.socialMedia.facebook, 100))
      return this.userGateway.emmitToUser(id, 'notification', {
        alertContent: 'Facebook link too long',
        color: 'danger',
      });

    if (!user)
      return this.userGateway.emmitToUser(id, 'notification', {
        alertContent: 'User not found',
        color: 'danger',
      });
    if (data.socialMedia.x) oldX = this.isValidTwitterLink(data.socialMedia.x);
    if (oldX === 'BAD_FORMAT')
      return this.userGateway.emmitToUser(id, 'notification', {
        alertContent: 'Bad social twitter link format',
        color: 'danger',
      });

    if (data.socialMedia.facebook)
      oldFacebook = this.isValidFacebookLink(data.socialMedia.facebook);
    if (oldFacebook === 'BAD_FORMAT')
      return this.userGateway.emmitToUser(id, 'notification', {
        alertContent: 'Bad social facebook link format',
        color: 'danger',
      });
    await this.userRepository.save(user);

    if (data.birthday) oldBirthday = this.checkDate(data.birthday);

    if (oldBirthday === 'BAD_DATE')
      return this.userGateway.emmitToUser(id, 'notification', {
        alertContent: 'Invalid birthday',
        color: 'danger',
      });
    oldAge = this.calculateAge(data.birthday);

    if (data.country) {
      if (data.country.toLocaleLowerCase() === 'israel')
        return this.userGateway.emmitToUser(id, 'notification', {
          alertContent: 'Free Palestine 🇵🇸🍉🇵🇸🍉🇵🇸🍉🇵🇸🍉',
          color: 'danger',
        });
      oldCountry = data.country;
    }
    if (data.sex) {
      console.log(data.sex);
      if (data.sex !== 'Female' && data.sex !== 'Male')
        return this.userGateway.emmitToUser(id, 'notification', {
          alertContent: 'Invalid Sex',
          color: 'danger',
        });
      oldSex = data.sex;
    }

    await this.userRepository.save(
      this.userRepository.create({
        id,
        age: oldAge,
        country: oldCountry,
        birthday: oldBirthday,
        x: oldX,
        facebook: oldFacebook,
        sex: oldSex,
      }),
    );
    return this.userGateway.emmitToUser(id, 'notification', {
      alertContent: 'User info updated successfully',
      color: 'success',
    });
  }

  formatDate(inputDate) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const dateObj = new Date(inputDate);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    return `${day} ${month} ${year} ${hours}:${minutes}`;
  }

  async findUsernameMatches(username: string) {
    const matches = await this.userRepository
      .findOne({
        where: { username },
        relations: ['firstPlayerMatches', 'secondPlayerMatches'],
      })
      .then(async (user) => {
        if (!user) return [];
        const allMatches = user.firstPlayerMatches.concat(
          user.secondPlayerMatches,
        );
        allMatches.sort((a, b) => {
          return a.id - b.id;
        });
        const returnMatches = await Promise.all(
          allMatches.map(async (match) => {
            let me;
            let opponent;
            if (user.firstPlayerMatches.includes(match)) {
              me = match.firstPlayerScore;
              opponent = match.secondPlayerScore;
            } else {
              me = match.secondPlayerScore;
              opponent = match.firstPlayerScore;
            }
            const oppUsername =
              username === match.loserUsername
                ? match.winnerUsername
                : match.loserUsername;
            const oppUser = await this.findOneByusername(oppUsername);
            return {
              id: match.id,
              me,
              opponent,
              myDisplayname: user.displayname,
              oppDisplayname: oppUser.displayname,
              myAvatar: user.avatar,
              oppAvatar: oppUser.avatar,
              winner: match.winnerUsername,
              loser: match.loserUsername,
              date: this.formatDate(match.date),
              result: me > opponent ? 'win' : 'lose',
            };
          }),
        );
        return returnMatches;
      });
    return matches;
  }

  async getLongestStreak(username: string) {
    const allMatches = await this.findUsernameMatches(username);
    let longestWinStreak = 0;
    let longestLoseStreak = 0;

    let currentWinStreak = 0;
    let currentLoseStreak = 0;

    allMatches.forEach((match) => {
      if (match.result === 'win') {
        currentWinStreak++;
        if (currentWinStreak > longestWinStreak)
          longestWinStreak = currentWinStreak;
        currentLoseStreak = 0;
      } else {
        currentLoseStreak++;
        if (currentLoseStreak > longestLoseStreak)
          longestLoseStreak = currentLoseStreak;
        currentWinStreak = 0;
      }
    });

    return { longestWinStreak, longestLoseStreak };
  }

  async blockFriend(id: number, targetId: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['blocked'],
    });
    const target = await this.userRepository.findOne({
      where: { id: targetId },
      relations: ['blockedBy'],
    });
    // return target;
    if (!target || !user)
      return this.userGateway.emmitToUser(user.id, 'notification', {
        alertContent: 'invalid user id',
        color: 'danger',
      });
    if (target.id === user.id)
      return this.userGateway.emmitToUser(user.id, 'notification', {
        alertContent: 'LOL did you just tried to block your self ???',
        color: 'danger',
      });
    if (user.blocked.some((blockedUser) => blockedUser.id === target.id))
      return this.userGateway.emmitToUser(user.id, 'notification', {
        alertContent: `${target.username} is already blocked`,
        color: 'danger',
      });
    await this.friendshipService.removeFriendship(id, targetId);
    user.blocked.push(target);
    target.blockedBy.push(user);
    await this.userRepository.save(target);
    await this.userRepository.save(user);
    return this.userGateway.emmitToUser(user.id, 'notification', {
      alertContent: `${target.username} blocked successfully`,
      color: 'success',
    });
  }

  async unBlockFriend(id: number, targetId: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['blocked'],
    });
    const target = await this.userRepository.findOne({
      where: { id: targetId },
      relations: ['blockedBy'],
    });
    if (!target || !user)
      return this.userGateway.emmitToUser(user.id, 'notification', {
        alertContent: 'unvalid user id',
        color: 'danger',
      });
    if (target.id === user.id)
      return this.userGateway.emmitToUser(user.id, 'notification', {
        alertContent: 'LOL did you just tried to unblock your self ???',
        color: 'danger',
      });
    if (!user.blocked.some((blockedUser) => blockedUser.id === target.id))
      return this.userGateway.emmitToUser(user.id, 'notification', {
        alertContent: `${target.username} is not blocked`,
        color: 'danger',
      });
    user.blocked = user.blocked.filter((user) => {
      user.id === target.id;
    });
    target.blockedBy = target.blockedBy.filter((target) => {
      target.id === user.id;
    });
    await this.userRepository.save(user);
    await this.userRepository.save(target);
    return this.userGateway.emmitToUser(user.id, 'notification', {
      alertContent: `${target.username} unblocked successfully`,
      color: 'success',
    });
  }

  async getWinrate(username: string) {
    const allMatches = await this.findUsernameMatches(username);
    let win = 0;
    let lose = 0;
    allMatches.forEach((match) => {
      if (match.result === 'win') win++;
      else lose++;
    });
    const winRate = (win / (win + lose)) * 100;
    return { win, lose, winRate };
  }

  async getLastMatch(username: string) {
    const allMatches = await this.findUsernameMatches(username);
    if (allMatches.length === 0) return null;
    const lastMatch = allMatches[allMatches.length - 1];
    const myScore = lastMatch.me;
    const secondPlayerScore = lastMatch.opponent;
    const secondPlayerUsername =
      lastMatch.result === 'lose' ? lastMatch.winner : lastMatch.loser;
    let timesWonAgainstOpponent = 0;
    let timesDefeatedByOpponent = 0;
    const me = await this.findOneByusername(username).then(
      (user) => user.displayname,
    );
    const secondPlayerdisplayname = await this.findOneByusername(
      secondPlayerUsername,
    ).then((user) => user.displayname);
    allMatches.map((match) => {
      if (match.winner == secondPlayerUsername) timesDefeatedByOpponent++;
      else if (match.loser == secondPlayerUsername) timesWonAgainstOpponent++;
    });
    return {
      me,
      secondPlayerdisplayname,
      timesWonAgainstOpponent,
      timesDefeatedByOpponent,
      myScore,
      secondPlayerScore,
    };
  }

  async clearUsernameMatches(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['firstPlayerMatches', 'secondPlayerMatches'],
    });
    user.firstPlayerMatches = [];
    user.secondPlayerMatches = [];
    await this.userRepository.save(user);
  }

  async findOneByIdWithChannels(id: number) {
    let user = await this.userRepository
      .findOne({
        where: { id },
        relations: [
          'blocked',
          'blockedBy',
          'channels',
          'channels.messages',
          'channels.messages.from',
          'channels.messages.seenBy',
        ],
      })
      .then((user) => {
        const { password, ...userWithoutPass } = user;
        return userWithoutPass;
      });
    if (user?.id !== id) return undefined;
    user.channels.forEach((channel) => {
      channel.messages = channel.messages.filter((message) => {
        if (
          user.blocked.some((blockedUser) => blockedUser.id === message.from.id)
        )
          return false;
        return true;
      });

      channel.messages.sort((a, b) => {
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

      if (channel.messages.length > 0) {
        channel.lastMessage = channel.messages[channel.messages.length - 1];
      }
    });

    // console.log('fetcher', user.username);
    // console.log('user.channels', user.channels);
    // user.channels.sort(()=>user.channels.)
    user.channels.sort((a, b) => {
      if (a.lastMessage && b.lastMessage) {
        return (
          b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
        );
      } else if (a.lastMessage) {
        return -1; // a comes first if b has no last message
      } else if (b.lastMessage) {
        return 1; // b comes first if a has no last message
      } else {
        return 0; // both a and b have no last message, they are equal
      }
    });

    const ret = user.channels.map((channel) => {
      const func = () => {
        if (!channel.lastMessage) return '';
        const now = new Date();
        const diff = Math.abs(
          now.getTime() - channel.lastMessage?.createdAt.getTime(),
        );
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);
        if (years > 0) return years + 'y';
        else if (months > 0) return months + 'm';
        else if (days > 0) return days + 'd';
        else if (hours > 0) return hours + 'h';
        else if (minutes > 0) return minutes + 'm';
        else return 'Now';
      };

      const unseenMessages = () => {
        let unseenNbr = 0;
        channel.messages.map((msg) => {
          if (
            !msg.seenBy.find((seenUser) => user.id === seenUser.id) &&
            user.id !== msg.from.id
          )
            unseenNbr++;
        });
        return unseenNbr > 0 ? unseenNbr : undefined;
      };

      return {
        id: channel.id,
        name: channel.name,
        avatar: channel.avatar,
        type: channel.type,
        lastMessage: channel.lastMessage?.message
          ? channel.lastMessage.message
          : 'No messages yet in this channel',
        lastMessageTimeToNow: func(),
        unseenNumber: unseenMessages(),
      };
    });

    // console.log('ret:', ret);
    return ret;
  }

  async findOneByEmail(email: string): Promise<any | undefined> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user?.email !== email) return undefined;
    const { password, ...userWithoutPass } = user;
    return userWithoutPass;
  }

  async createThirdParty(data: createUserThirdPartyDto): Promise<User> {
    const userExists = await this.userRepository.findOne({
      where: { displayname: data.username },
    });
    let displayname = data.username;
    let username = data.username;
    console.log('original displayname is ', displayname);
    console.log('original username is ', username);
    if (userExists) {
      displayname += Math.floor(Math.random() * 1000);
      data.username = displayname;
      console.log('username already exists, changing it to ', data.username);
      console.log('displayname already exists, changing it to ', displayname);
    }
    const user = this.userRepository.create({
      ...data,
      displayname,
      password: '-',
    });
    return this.userRepository.save(user);
  }

  async create(data: createUserDto, hashedPass: string): Promise<User> {
    const displayname = data.username;
    const user = this.userRepository.create({
      ...data,
      displayname,
      password: hashedPass,
    });
    console.log(user);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async update(id: number, user: User): Promise<void> {
    await this.userRepository.update(id, user);
  }

  async updateChatSocketId(id: number, chatSocketId: string): Promise<void> {
    console.log('updating chat socket id to userId ', id);
    await this.userRepository.update(id, { chatSocketId }); // this is not working because the id is not the user id
    // this.findAll().then((users) => console.log(users));
  }

  async findUsernameChats(username: string): Promise<User> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['chat'],
    });
  }

  async getUserWithFriends(userId: number): Promise<User> {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friendships'],
    });
  }

  async updateAvatar(username: string, avatar: string): Promise<void> {
    // remove the 'dist' from the path
    const user = await this.userRepository.findOne({ where: { username } });
    let oldAvatar = user.avatar;
    if (oldAvatar.includes('uploads')) {
      oldAvatar = oldAvatar.replace(process.env.BACKEND_URL + '/', '');
      const fs = require('fs');
      fs.unlink(oldAvatar, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
    avatar = process.env.BACKEND_URL + '/' + avatar;
    await this.userRepository.update(user.id, { avatar });
  }

  update2FASecret(userId: number, secret: string) {
    return this.userRepository.update(userId, {
      twofasecret: secret,
    });
  }

  async update2FA(userId: number, twofa: string) {
    return this.userRepository.update(userId, {
      twofa,
    });
  }

  async updateDisplayname(username: string, displayname: string) {
    let user = await this.userRepository.findOne({
      where: { username },
    });
    if (!displayname.length) {
      this.userGateway.emmitToUser(user.id, 'notification', {
        alertContent: `Display name cannot be empty`,
        color: 'danger',
      });
      return undefined;
    }
    if (displayname.length > 10) {
      this.userGateway.emmitToUser(user.id, 'notification', {
        alertContent: `Display name length must be less than 8 characters`,
        color: 'danger',
      });
      return undefined;
    }
    if (user.displayname === displayname) {
      this.userGateway.emmitToUser(user.id, 'notification', {
        alertContent: `Display name ${displayname} is the same as the current one`,
        color: 'danger',
      });
      return undefined;
    }
    // check if the new displayname already exists
    const userExists = await this.userRepository.findOne({
      where: { displayname },
    });
    if (userExists) {
      this.userGateway.emmitToUser(user.id, 'notification', {
        alertContent: `Display name ${displayname} already exists`,
        color: 'danger',
      });
      return undefined;
    }
    console.log('updating displayname to ', displayname);
    await this.userRepository.update(user.id, { displayname });
    user = await this.userRepository.findOne({ where: { displayname } });
    this.userGateway.emmitToUser(user.id, 'notification', {
      alertContent: `Display name updated to ${displayname}`,
      color: 'success',
    });
    return user;
  }

  async searchUsers(searchValue: string, username: string, id: number) {
    if (!searchValue.length) return [];
    let users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.displayname like :lookLikeTarget', {
        lookLikeTarget: `%${searchValue}%`,
      })
      .leftJoinAndSelect('user.friends', 'friends')
      .leftJoinAndSelect('user.blocked', 'blocked')
      .getMany()
      .then((users) => {
        return users.map((user) => {
          return {
            id: user.id,
            username: user.username,
            displayname: user.displayname,
            avatar: user.avatar,
            isFriend: user.friends.some(
              (friend) => friend.username === username,
            ),
            status: '',
          };
        });
      });

    const user1 = await this.userRepository.findOne({
      where: { username },
      relations: ['blocked', 'blockedBy'],
    });
    const user1Id = user1.id;

    users = await Promise.all(
      users.map(async (user) => {
        const user2Id = user.id;
        const friendship = await this.friendshipService.getFriendship(
          user1Id,
          user2Id,
        );
        if (user1.blocked.some((blockedUser) => blockedUser.id === user2Id))
          user.status = FriendshipStatus.BLOCKED;
        else if (
          user1.blockedBy.some((blockedUser) => blockedUser.id === user2Id)
        )
          user.status = FriendshipStatus.BLOCKED_BY_HIM;
        else if (!friendship) {
          user.status = FriendshipStatus.NOT_FRIEND;
        } else if (
          friendship.accepted === false &&
          friendship.sentBy === user1Id
        ) {
          user.status = FriendshipStatus.PENDING;
        } else if (
          friendship.accepted === false &&
          friendship.sentBy === user2Id
        ) {
          user.status = FriendshipStatus.REQUESTED;
        } else if (friendship.accepted === true) {
          user.status = FriendshipStatus.FRIEND;
        }
        return user;
      }),
    );
    users = users
      .filter((user) => user.username !== username)
      .filter(
        (user) =>
          user.status !== FriendshipStatus.BLOCKED &&
          user.status !== FriendshipStatus.BLOCKED_BY_HIM,
      );
    return users;
  }

  async getLeaderboard(x: number, username: string) {
    const users = await this.userRepository
      .find({
        order: { points: 'DESC' },
      })
      .then((u) => {
        if (!u) return;
        return u.map((user, index) => {
          return {
            id: user.id,
            username: user.username,
            displayname: user.displayname,
            avatar: user.avatar,
            wins: user.win,
            losses: user.lose,
            score: user.points,
            rank: index + 1,
          };
        });
      });
    const fetcher = users.find((u) => u.username === username);
    if (fetcher?.rank > x && x !== -1) users[x - 1] = fetcher;
    return users;
  }
}
