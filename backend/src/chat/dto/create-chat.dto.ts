export class CreateDmDto {
  avatar: string;
  message: string;
  from: string;
  to: string;
}

export class MessageChannelDto {
  from: string;
  avatar: string;
  to: number;
  message: string;
}
