import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Friendship {
  @PrimaryColumn()
  user1Id: number;

  @PrimaryColumn()
  user2Id: number;

  @ManyToOne(() => User, (user) => user.friendships)
  @JoinColumn({ name: 'user1Id' })
  user1: User;

  @ManyToOne(() => User, (user) => user.friendships)
  @JoinColumn({ name: 'user2Id' })
  user2: User;

  @Column({ default: false })
  accepted: boolean;

  @Column({ default: 1 })
  sentBy: number;
}
