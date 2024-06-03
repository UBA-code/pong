import { PartialType } from '@nestjs/mapped-types';
import { CreateDmDto } from './create-chat.dto';

export class UpdateChatDto extends PartialType(CreateDmDto) {
  id: number;
}
