import { Column, Entity, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ManyToOne } from 'typeorm';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @ManyToOne(() => User, (user) => user.sentDms)
  @JoinColumn({ name: 'from' })
  from: User;

  @ManyToOne(() => User, (user) => user.receivedDms)
  @JoinColumn({ name: 'to' })
  to: User;

  @Column({ default: false })
  seen: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  // @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
