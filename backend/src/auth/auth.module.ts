import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthIntraService } from './auth.intra.service';
import { APP_FILTER } from '@nestjs/core';
import { TokenExpiredExceptionFilter } from './token-expired-exception.filter';
import { TokenService } from './token.service';
import { friendshipService } from 'src/user/friendship.service';
import { Friendship } from 'src/user/entities/friendship.entity';
import { UserGateway } from 'src/user/user.gateway';
import { UserGatewayModule } from 'src/user/user.gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friendship]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    UserGatewayModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    AuthIntraService,
    friendshipService,
    // {
    //   provide: 'AUTH_SERVICE', // this is for the strategy to use the AuthService class
    //   useClass: AuthService,
    // },
    // {
    //   provide: 'USER_SERVICE',
    //   useClass: UserService,
    // },
    {
      provide: APP_FILTER,
      useClass: TokenExpiredExceptionFilter,
    },
    TokenService,
  ],
})
export class AuthModule {}
