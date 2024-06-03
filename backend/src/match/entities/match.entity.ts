import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.firstPlayerMatches)
  firstPlayer: User;

  @ManyToOne(() => User, (user) => user.secondPlayerMatches) // many to one relation because one user can play many matches but one match has only one user as a second player
  secondPlayer: User;

  @Column()
  firstPlayerScore: number;

  @Column()
  secondPlayerScore: number;

  @Column()
  winnerUsername: string;

  @Column()
  loserUsername: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  // @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;
}
