import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';
import { Response } from 'express';
import { createUserThirdPartyDto } from 'src/user/dtos/createUser.dto';

@Injectable()
export class AuthIntraService {
  constructor(private jwtService: JwtService) {}

  getToken(code: string) {
    const data = {
      grant_type: 'authorization_code',
      client_id: process.env.INTRA_CLIENT_ID,
      client_secret: process.env.INTRA_CLIENT_SECRET,
      code,
      redirect_uri: process.env.INTRA_REDIRECT_URI,
    };
    console.log('data', data);
    return fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());
  }

  async getUserInfo(token: string): Promise<createUserThirdPartyDto> {
    try {
      if (!token) {
        throw new Error('No token provided to getUserInfo');
      }
      const response = await fetch('https://api.intra.42.fr/v2/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userInfo = await response.json();
      userInfo.accessToken = token;

      const importantInfos = {
        username: userInfo.login,
        email: userInfo.email,
        avatar: userInfo.image.link,
        accessToken: userInfo.accessToken,
        thirdParty: 'intra',
      };
      return importantInfos;
    } catch (error) {
      console.error('Error fetching user infos:', error);
    }
  }

  redirectToIntra(res: Response) {
    const url = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.INTRA_CLIENT_ID}&redirect_uri=${process.env.INTRA_REDIRECT_URI}&response_type=code`;
    console.log('redirecting to', url);
    return res.redirect(url);
  }
}
