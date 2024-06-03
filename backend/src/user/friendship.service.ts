import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Friendship } from './entities/friendship.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserGateway } from './user.gateway';

@Injectable()
export class friendshipService {
  constructor(
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private userGateway: UserGateway,
  ) {}

  async acceptFriendship(user1Id: number, user2Id: number) {
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { user1Id: user1Id, user2Id: user2Id, accepted: false },
        { user1Id: user2Id, user2Id: user1Id, accepted: false },
      ],
    });
    if (!friendship) {
      console.log('Friendship Request does not exist');
      return 'Friendship Request does not exist';
    }
    if (friendship.sentBy === user1Id) {
      console.log('You cannot accept your own friend request');
      return 'You cannot accept your own friend request';
    }
    friendship.accepted = true;
    try {
      await this.friendshipRepository.save(friendship);
      const user = await this.userRepository.findOne({
        where: { id: user1Id },
        relations: ['friends'],
      });
      const friend = await this.userRepository.findOne({
        where: { id: user2Id },
        relations: ['friends'],
      });
      user.friends.push(friend);
      friend.friends.push(user);
      await this.userRepository.save(user);
      await this.userRepository.save(friend);
      const userSender = friendship.sentBy === user1Id ? friend : user;

      this.userGateway.emmitToUser(friendship.sentBy, 'notification', {
        alertContent: `${userSender.displayname} just accepted your friend request`,
        color: 'success',
      });
    } catch (e) {
      return 'An error occurred';
    }
    return friendship;
  }

  async createFriendship(user1Id: number, user2Id: number) {
    if (user1Id === user2Id) return 'You cannot add yourself as a friend';
    const sender = await this.userRepository.findOne({
      where: { id: user1Id },
      relations: ['blocked', 'blockedBy'],
    });
    if (sender.blocked.some((blocked) => blocked.id === user2Id))
      return 'You blocked this user';
    if (sender.blockedBy.some((blocked) => blocked.id === user2Id))
      return "You've been blocked by this user";
    const friendship = this.friendshipRepository.create({
      user1Id,
      user2Id,
      accepted: false,
      sentBy: user1Id,
    });
    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        { user1Id: user1Id, user2Id: user2Id },
        { user1Id: user2Id, user2Id: user1Id },
      ],
    });
    if (existingFriendship) {
      if (existingFriendship.accepted) return 'Friendship already exists';
      else if (existingFriendship.sentBy === user1Id)
        return 'Friend request already sent';
      else {
        console.log('accepting automatically friendship request');
        this.acceptFriendship(user1Id, user2Id);
        // ! emit the event to the user who received the friend request
        return existingFriendship;
      }
    } else
      this.userGateway.emmitToUser(user2Id, 'notification', {
        alertContent: `${sender.displayname} wants to be your friend`,
        color: 'neutral',
        save: {
          username: sender.username,
          displayname: sender.displayname,
          avatar: sender.avatar,
          type: 'Friend Request',
        },
      });
    try {
      await this.friendshipRepository.save(friendship);
    } catch (e) {
      return 'An error occurred';
    }
    return friendship;
  }

  async getFriendship(user1Id: number, user2Id: number) {
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { user1Id: user1Id, user2Id: user2Id },
        { user1Id: user2Id, user2Id: user1Id },
      ],
    });
    return friendship;
  }

  async getFriendships(userId: number) {
    const friendships = await this.friendshipRepository.find({
      where: [
        { user1Id: userId, accepted: true },
        { user2Id: userId, accepted: true },
      ],
    });
    return friendships;
  }

  async sentRequests(userId: number) {
    const friendships = await this.friendshipRepository.find({
      where: [{ sentBy: userId, accepted: false }],
    });
    return friendships;
  }

  async getWaitingApprouvalFriendships(userId: number) {
    let friendships = await this.friendshipRepository
      .find({
        where: [
          { user1Id: userId, accepted: false },
          { user2Id: userId, accepted: false },
        ],
      })
      .then((friendships) =>
        friendships.filter((friendship) => friendship.sentBy !== userId),
      );

    // console.log('waiting for my approuval :', friendships);
    return friendships;
  }

  async removeFriendship(user1Id: number, user2Id: number) {
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { user1Id: user1Id, user2Id: user2Id },
        { user1Id: user2Id, user2Id: user1Id },
      ],
    });
    if (!friendship) {
      return 'Friendship does not exist';
    }
    try {
      await this.friendshipRepository.remove(friendship);
      const user = await this.userRepository.findOne({
        where: { id: user1Id },
        relations: ['friends'],
      });
      const friend = await this.userRepository.findOne({
        where: { id: user2Id },
        relations: ['friends'],
      });
      user.friends = user.friends.filter((f) => f.id !== user2Id);
      friend.friends = friend.friends.filter((f) => f.id !== user1Id);
      await this.userRepository.save(user);
      await this.userRepository.save(friend);
    } catch (e) {
      return 'An error occurred';
    }
    return friendship;
  }

  async isFriend(user1Username: string, user2Username: string) {
    const user1 = await this.userRepository.findOne({
      where: { username: user1Username },
    });

    const user2 = await this.userRepository.findOne({
      where: { username: user2Username },
    });

    if (!user1 || !user2) return false;

    const areFriends = await this.friendshipRepository.findOne({
      where: [
        { user1Id: user1.id, user2Id: user2.id, accepted: true },
        { user1Id: user2.id, user2Id: user1.id, accepted: true },
      ],
    });

    return areFriends ? true : false;
  }
}
