import { Module } from '@nestjs/common';
import { UserGateway } from './user.gateway';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Notification } from './entities/notifications.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Notification]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [UserGateway],
  exports: [UserGateway], // If needed in other modules
})
export class UserGatewayModule {}
