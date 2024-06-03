import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  // BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { createUserDto } from 'src/user/dtos/createUser.dto';
import { Response, Request } from 'express';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthIntraService } from './auth.intra.service';
import { JwtService } from '@nestjs/jwt';
import { createUserThirdPartyDto } from 'src/user/dtos/createUser.dto';
import { UserService } from 'src/user/user.service';
import { JwtAuthGuard } from './guards/auth.guard';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { User } from 'src/user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private AuthIntraService: AuthIntraService,
    private jwtService: JwtService,
    private UserService: UserService,
  ) {}

  @Get('login')
  async loginGet(@Req() req: Request, @Res() res: Response) {
    const jwt = req.cookies.jwt;
    if (jwt) {
      console.log('user is already logged in no login page !');
      const json = {
        message: 'Unauthorized',
        redirectTo: '/',
      };
      return res.send(json);
    }
  }

  @Get('signout')
  signOutGet(@Res() res: Response) {
    res.clearCookie('jwt');
    res.clearCookie('user');
    res.clearCookie('refreshToken');
    const json = JSON.stringify({ status: 1 });
    return res.send(json);
  }

  @Get('intra')
  async intraLongin(
    @Req() req: Request,
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    console.log('intra login');

    if (req.cookies.jwt) {
      console.log('user is already logged in !!!!!!!!!');
      return res.redirect(process.env.FRONTEND_URL);
    }
    if (!code) {
      console.log('no code');
      return this.AuthIntraService.redirectToIntra(res);
    }
    const token = await this.AuthIntraService.getToken(code);
    if (!token.access_token) {
      return res.send({ token });
    }
    let userFromIntra = await this.AuthIntraService.getUserInfo(
      token.access_token,
    );
    let userToSave: User;

    if (!userFromIntra) return { message: 'error: no user info' };

    const userAlreadyExists = await this.UserService.findOneByEmail(
      userFromIntra.email,
    );

    if (!userAlreadyExists) {
      userToSave = await this.UserService.createThirdParty(userFromIntra);
    } else {
      userToSave = await this.UserService.findOneByusername(
        userFromIntra.username,
      );
    }
    let twoFa = false;
    if (userAlreadyExists?.twofa === 'ENABLED') twoFa = true;

    // console.log('user to save - - - - - ', userToSave);
    const jwt = this.jwtService.sign(
      { username: userToSave.username, id: userToSave.id, twoFa },
      { expiresIn: '1h' },
    );
    const refreshToken = this.jwtService.sign(
      { username: userToSave.username, id: userToSave.id, twoFa },
      { expiresIn: '7d' },
    );
    res.cookie('jwt', jwt, { httpOnly: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    let redirect = twoFa ? '/2fa' : userAlreadyExists ? '/' : '/settings';
    return res.redirect(`${process.env.FRONTEND_URL}${redirect}`);
  }

  @Get('whoami')
  @UseGuards(JwtAuthGuard)
  async whoami(
    @Req() req: Request,
    @Res() res: Response,
    @Query('username') username: string,
  ) {
    if (username) {
      const user = await this.UserService.findOneByusername(username);
      if (!user)
        return res.send({ message: 'user not found', username: username });
      return res.send(user);
    }
    const jwt = req.cookies.jwt;
    if (!jwt)
      return res.send({ message: 'user not logged in', redirectTo: '/login' });
    const payload = await this.jwtService.verify(jwt);
    // console.log('payload', payload);
    const user = await this.UserService.findOneByusername(payload['username']);
    return res.send(user);
  }

  @Get('token')
  @UseGuards(JwtAuthGuard)
  async verifyToken(@Req() req: Request, @Res() res: Response) {
    const jwt = req.cookies.jwt;
    // console.log('jwt in the /auth/token', jwt);
    if (!jwt)
      return res.send({ message: 'user not logged in', redirectTo: '/login' });

    return res.send({ jwt });
  }

  @Get('2fa/enable')
  @UseGuards(JwtAuthGuard)
  async enable2FA(@Req() req: Request, @Res() res: Response) {
    console.log('enable 2fa');
    const jwt = req.cookies.jwt;
    if (!jwt)
      return res.send({ message: 'user not logged in', redirectTo: '/login' });
    const payload = await this.jwtService.verify(jwt);
    const user = await this.UserService.findOneByusername(payload['username']);
    if (!user) return res.send({ message: 'user not found' });
    let secret;
    if (user.twofasecret !== 'NOT_ENABLED') {
      secret = user.twofasecret;
      console.log('2fa already enabled', secret);
    } else {
      secret = await this.authService.generate2FASecret().base32;
      await this.UserService.update2FASecret(user.id, secret);
    }
    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      label: user.username + ' - PingPong App',
      encoding: 'base32',
    });
    const qrCodeImage = await qrcode.toDataURL(otpauthUrl);
    return res.send({ qrCodeImage });
  }

  @Get('2fa/disable')
  @UseGuards(JwtAuthGuard)
  async disable2FA(@Req() req: Request, @Res() res: Response) {
    const jwt = req.cookies.jwt;
    if (!jwt)
      return res.send({ message: 'user not logged in', redirectTo: '/login' });
    const payload = await this.jwtService.verify(jwt);
    const user = await this.UserService.findOneByusername(payload['username']);
    // const user = await this.UserService.findOneByusername('hidhmmou');
    if (!user) return res.send({ message: 'user not found' });
    if (user.twofasecret === 'NOT_ENABLED')
      return res.send({ message: '2fa not enabled' });
    await this.UserService.update2FASecret(user.id, 'NOT_ENABLED');
    await this.UserService.update2FA(user.id, 'NOT_ENABLED');
    return res.send({ message: 'success' });
  }

  @Get('2fa/status')
  @UseGuards(JwtAuthGuard)
  async get2FAStatus(@Req() req: Request, @Res() res: Response) {
    const jwt = req.cookies.jwt;
    if (!jwt)
      return res.send({ message: 'user not logged in', redirectTo: '/login' });
    const payload = await this.jwtService.verify(jwt);
    const user = await this.UserService.findOneByusername(payload['username']);
    if (!user) return res.send({ message: 'user not found' });
    return res.send({ status: user.twofa === 'ENABLED' });
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  async verify2FA(
    @Req() req: Request,
    @Res() res: Response,
    @Body('token') token: string,
  ) {
    const jwt = req.cookies.jwt;
    if (!jwt)
      return res.send({ message: 'user not logged in', redirectTo: '/login' });
    const payload = await this.jwtService.verify(jwt);
    const user = await this.UserService.findOneByusername(payload['username']);
    // const user = await this.UserService.findOneByusername('hidhmmou');
    if (!user) return res.send({ message: 'user not found' });
    // console.log('username is : ', user.username);
    // console.log('token is : ', token);
    const secret = user.twofasecret;
    // console.log('secret is : ', secret);
    if (secret === 'NOT_ENABLED')
      return res.send({ message: '2fa not enabled' });
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });
    if (verified) {
      if (user.twofa === 'NOT_ENABLED')
        await this.UserService.update2FA(user.id, 'ENABLED');
      console.log('2fa verified');
      return res.send({ message: 'success' });
    }
    console.log('2fa not verified');
    return res.send({ message: 'invalid token' });
  }

  @Get('2fa/isActivated')
  async twoFaActivated(@Req() req: Request, @Res() res: Response) {
    const jwt = req.cookies.jwt;
    if (!jwt)
      return res.send({ message: 'user not logged in', redirectTo: '/login' });
    const payload = await this.jwtService.verify(jwt);
    if (!payload.twoFa) {
      const json = {
        message: 'Unauthorized',
        redirectTo: '/profile',
      };
      return res.send(json);
    }
  }

  @Post('2fa/login')
  async login2FA(
    @Req() req: Request,
    @Res() res: Response,
    @Body('token') token: string,
  ) {
    const jwt = req.cookies.jwt;
    if (!jwt)
      return res.send({ message: 'user not logged in', redirectTo: '/login' });
    const payload = await this.jwtService.verify(jwt);
    const user = await this.UserService.findOneByusername(payload['username']);
    // const user = await this.UserService.findOneByusername('hidhmmou');
    if (!user) return res.send({ message: 'user not found' });
    // console.log('username is : ', user.username);
    // console.log('token is : ', token);
    const secret = user.twofasecret;
    // console.log('secret is : ', secret);
    if (secret === 'NOT_ENABLED')
      return res.send({ message: '2fa not enabled' });
    let verified;

    verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });
    if (verified) {
      res.clearCookie('jwt');
      const jwt = this.jwtService.sign(
        { username: payload.username, id: payload.id, twoFa: false },
        { expiresIn: '1h' },
      );
      res.cookie('jwt', jwt, { httpOnly: true });
      console.log('2fa verified after login redirecting to profile');
      const json = {
        message: 'Unauthorized',
        redirectTo: '/profile',
      };
      return res.send(json);
    }
    console.log('2fa not verified');
    return res.send({ message: 'invalid token' });
  }
}
