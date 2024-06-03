import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { TokenExpiredError } from 'jsonwebtoken';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';

@Catch(TokenExpiredError)
export class TokenExpiredExceptionFilter implements ExceptionFilter {
  constructor(
    private jwtService: JwtService,
    private tokenService: TokenService,
  ) {}

  async catch(exception: TokenExpiredError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    try {
      console.log('refreshing token');
      await this.jwtService.verifyAsync(request.cookies.refreshToken);
      console.log('refresh token is valid');
      const decoded = this.jwtService.decode(request.cookies.jwt);
      const username = decoded['username'];
      const id = decoded['id'];
      const newAccessToken = this.tokenService.generateAccessToken(
        username,
        id,
      );
      const newRefreshToken = this.tokenService.generateRefreshToken(
        username,
        id,
      );

      response.clearCookie('jwt');
      response.cookie('jwt', newAccessToken, { httpOnly: true });
      response.cookie('refreshToken', newRefreshToken, { httpOnly: true });
      console.log('a new token has been sent');
      response.send({ message: 'Token refreshed' });
    } catch (e) {
      console.log(' - - - - - refresh token expired - - - - -');
      response.clearCookie('jwt');
      response.clearCookie('refreshToken');
      console.log(
        ' - - - - - clearing the jwt and the refresh tokem - - - - -',
      );
      const json = {
        message: 'Unauthorized',
        redirectTo: '/login',
      };
      response.send(json);
    }
  }
}
