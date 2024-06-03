import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  generateAccessToken(username: string, id: number): string {
    const payload = { username, id };
    return this.jwtService.sign(payload, { expiresIn: '1h' }); // Sign with 1 day expiration
  }

  generateRefreshToken(username: string, id: number): string {
    const payload = { username, id };
    return this.jwtService.sign(payload, { expiresIn: '7d' }); // Sign with 7 days expiration
  }
}
