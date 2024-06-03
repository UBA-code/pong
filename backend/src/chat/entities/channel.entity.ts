import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ChannelMsgs } from './channelmsgs.entity';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '-' })
  avatar: string;

  @Column({ default: 'public' })
  type: string;

  @Column({ nullable: true })
  password: string;

  @ManyToMany(() => User, (user) => user.channels)
  @JoinTable()
  users: User[];

  @ManyToMany(() => User, (user) => user.adminChannels)
  @JoinTable()
  @JoinColumn()
  admins: User[];

  @ManyToMany(() => User, (user) => user.bannedChannels)
  @JoinTable()
  banned: User[];

  @ManyToMany(() => User, (user) => user.mutedChannels)
  @JoinTable()
  muted: User[];

  @ManyToOne(() => User, (user) => user.createdChannels)
  @JoinColumn()
  createdBy: User;

  @OneToMany(() => ChannelMsgs, (channelMsgs) => channelMsgs.channel, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  messages: ChannelMsgs[];

  @OneToOne(() => ChannelMsgs, { cascade: true, onDelete: 'CASCADE' })
  lastMessage: ChannelMsgs;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  // @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
