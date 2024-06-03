import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Matchhistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstPlayerId: number;

  @Column()
  secondPlayerId: number;

  @Column({ default: '' })
  secondPlayerdisplayname: string;

  @Column({ default: '' })
  firstPlayerdisplayname: string;

  // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  // date: Date;

  @Column()
  firstPlayerScore: number;

  @Column()
  secondPlayerScore: number;

  @Column()
  winnerId: number;
}
