import { Injectable, BadRequestException } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserService } from '../user/user.service';
import { createUserDto } from 'src/user/dtos/createUser.dto';
import { JwtService } from '@nestjs/jwt';
import * as speakeasy from 'speakeasy';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private UserService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(data: createUserDto) {
    const usedMail = await this.UserService.findOneByEmail(data.email);
    const usedName = await this.UserService.findOneByusername(data.username);

    if (usedMail) throw new BadRequestException(`Email already exists`);
    if (usedName) throw new BadRequestException(`Username already exists`);

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(data.password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    this.UserService.create(data, result);
    return 'User Created Successfully';
  }

  async signIn(email: string, password: string) {
    console.log('email : ', email);
    const user = await this.UserService.findOneByusername(email);

    if (!user) throw new BadRequestException(`Invalid Credentials`);

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex'))
      throw new BadRequestException(`Invalid Credentials`);

    console.log('user is : ', user);

    return user;
  }

  async generateJWT(user: any) {
    const payload = { username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getUser(jwt: string) {
    if (!jwt) {
      console.log('no jwt');
      return null;
    }
    try {
      const payload = await this.jwtService.verify(jwt);
      // console.log('payload is : ', payload);
      const { password, ...user } = await this.UserService.findOneByusername(
        payload.username,
      );
      return user;
    } catch (e) {
      return null;
    }
  }

  async verifyToken(jwt: string) {
    if (!jwt) {
      console.log('no jwt');
      return null;
    }
    return this.jwtService.verify(jwt);
  }

  generate2FASecret() {
    return speakeasy.generateSecret({ length: 20 });
  }
}
