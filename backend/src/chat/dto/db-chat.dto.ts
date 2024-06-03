import { User } from 'src/user/entities/user.entity';

export class DbChatDto {
  message: string;
  from: User;
  to: User;
}
