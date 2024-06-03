import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class createUserDto {
  @IsNotEmpty()
  username: string;
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}

export class createUserThirdPartyDto {
  @IsNotEmpty()
  username: string;
  @IsEmail()
  email: string;
  @IsString()
  accessToken: string;
  @IsString()
  avatar: string;
  @IsString()
  thirdParty: string;
}
