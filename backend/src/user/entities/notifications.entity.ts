import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  avatar: string;

  @Column()
  username: string;

  @Column()
  displayname: string;

  @Column()
  type: string;

  @Column({ default: '' })
  message: string;

  @Column()
  read: boolean;
}
