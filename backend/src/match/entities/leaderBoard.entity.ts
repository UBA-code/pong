// import { User } from 'src/user/entities/user.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LeaderBoard {
  //   @OneToOne(() => User)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  playerId: number;

  @Column({ nullable: true })
  displayname: string;

  @Column({ nullable: true, default: 0 })
  wins: number;

  @Column({ nullable: true, default: 0 })
  losses: number;

  @Column({ nullable: true, default: 0 })
  score: number;
}
