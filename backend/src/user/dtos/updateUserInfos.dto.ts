import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SocialMedia {
  @IsString()
  @IsOptional()
  x: string;

  @IsString()
  @IsOptional()
  facebook: string;
}

export class Infos {
  @IsNotEmpty()
  // @IsDate()
  birthday: Date;

  @IsString()
  sex: 'Male' | 'Female';

  @IsString()
  country: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SocialMedia)
  socialMedia: SocialMedia;
}
