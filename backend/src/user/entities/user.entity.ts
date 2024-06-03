import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  BeforeInsert,
} from 'typeorm';
import { UserStatus } from '../enums/enums';
import { Chat } from 'src/chat/entities/chat.entity';
import { Friendship } from './friendship.entity';
import { ChannelMsgs } from 'src/chat/entities/channelmsgs.entity';
import { Channel } from 'src/chat/entities/channel.entity';
import { Match } from 'src/match/entities/match.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  displayname: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  rankAvatar: string;

  @BeforeInsert()
  setRankAvatar() {
    this.rankAvatar = process.env.BACKEND_URL + '/uploads/ranks/1.png';
  }

  @Column({ nullable: true })
  accessToken: string;

  @Column({ default: 'NOT_ENABLED', nullable: true })
  twofasecret: string;

  @Column({ default: 'NOT_ENABLED', nullable: true })
  twofa: string;

  @Column()
  password: string;

  @Column({ default: UserStatus.ONLINE })
  status: string;

  @Column({ default: 0 })
  win: number;

  @Column({ default: 0 })
  lose: number;

  @Column({ default: 0 })
  points: number;

  @Column({ default: 0 })
  age: number;

  @Column({ default: new Date().toISOString().slice(0, 10) })
  birthday: string;

  @Column({ default: '-' })
  sex: string;

  @Column({ default: '-' })
  country: string;

  @Column({ default: '-' })
  thirdParty: string;

  @Column({ default: '-' })
  chatSocketId: string;

  @Column({ nullable: true })
  x: string;

  @Column({ nullable: true })
  facebook: string;

  @OneToMany(() => Friendship, (friendship) => friendship.user1)
  friendships: Friendship[];

  @ManyToMany(() => User)
  @JoinTable()
  friends: User[];

  @ManyToMany(() => User)
  @JoinTable()
  blocked: User[];

  @ManyToMany(() => User)
  @JoinTable()
  blockedBy: User[];

  @OneToMany(() => Chat, (chat) => chat.from)
  sentDms: Chat[];

  @OneToMany(() => Chat, (chat) => chat.to)
  receivedDms: Chat[];

  @OneToMany(() => ChannelMsgs, (ChannelMsgs) => ChannelMsgs.from)
  sentChannels: ChannelMsgs[];

  @ManyToMany(() => Channel, (channel) => channel.users)
  channels: Channel[];

  @ManyToMany(() => Channel, (channel) => channel.admins)
  adminChannels: Channel[];

  @ManyToMany(() => Channel, (channel) => channel.banned)
  bannedChannels: Channel[];

  @ManyToMany(() => Channel, (channel) => channel.muted)
  mutedChannels: Channel[];

  @OneToMany(() => Channel, (channel) => channel.createdBy)
  createdChannels: Channel[];

  @ManyToMany(() => ChannelMsgs, (ChannelMsgs) => ChannelMsgs.seenBy)
  @JoinTable()
  seenMessages: ChannelMsgs[];

  @OneToMany(() => Match, (match) => match.firstPlayer)
  firstPlayerMatches: Match[];

  @OneToMany(() => Match, (match) => match.secondPlayer)
  secondPlayerMatches: Match[];
}
