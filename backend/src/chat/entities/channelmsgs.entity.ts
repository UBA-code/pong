import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { Channel } from './channel.entity';

@Entity()
export class ChannelMsgs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'this is the default (test)' })
  message: string;

  @ManyToOne(() => User, (user) => user.sentChannels, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  from: User;

  @ManyToMany(() => User, (user) => user.seenMessages, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  seenBy: User[];

  @ManyToOne(() => Channel, (channel) => channel.id, {
    onDelete: 'SET NULL',
  })
  channel: Channel;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  // @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
