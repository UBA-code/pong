import { IsOptional } from 'class-validator';

export class createChannelDto {
  id: number;
  name: string;
  type: string;
  avatar: string;
  @IsOptional()
  password: string;
  @IsOptional()
  createdBy: number;
}
