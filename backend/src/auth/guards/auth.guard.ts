import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard {
  constructor(private jwtService: JwtService) {}

  generateAccessToken(payload): string {
    const { iat, exp, ...payloadTosign } = payload;
    return this.jwtService.sign(payloadTosign, { expiresIn: '1h' });
  }

  generateRefreshToken(payload): string {
    const { iat, exp, ...payloadTosign } = payload;
    return this.jwtService.sign(payloadTosign, { expiresIn: '7d' }); // Sign with 7 days expiration
  }

  refreshToken(refreshToken: string): string {
    let payload;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch (e) {
      return null;
    }
    return this.generateAccessToken(payload);
  }

  canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    if (request.cookies.jwt) {
      let payload;
      try {
        payload = this.jwtService.verify(request.cookies.jwt);
      } catch (e) {
        const newToken = this.refreshToken(request.cookies.refreshToken);
        if (!newToken) {
          response.clearCookie('jwt');
          response.clearCookie('refreshToken');
          const json = {
            message: 'Unauthorized',
            redirectTo: '/login',
          };
          response.send(json);
          return false;
        }
        response.cookie('jwt', newToken, { httpOnly: true });
        request.cookies.jwt = newToken;
      }
      if (payload?.twoFa) {
        const json = {
          message: 'Unauthorized',
          redirectTo: '/2fa',
        };
        response.send(json);
        return false;
      }
      request.user = this.jwtService.verify(request.cookies.jwt);
    } else {
      const json = {
        message: 'Unauthorized',
        redirectTo: '/login',
      };
      response.send(json);
      return false;
    }
    return true;
  }
}

@Injectable()
export class JwtAuthGuardMatch {
  constructor(private jwtService: JwtService) {}
  canActivate(context) {
    const request = context.switchToHttp().getRequest();
    console.log('Match request.url : ', request.url);
    return true;
  }
}
