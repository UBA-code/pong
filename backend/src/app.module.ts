import { Module } from '@nestjs/common';
import { UsersModule } from './user/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { Matchhistory } from './match/entities/matchHistory.entity';
import { LeaderBoard } from './match/entities/leaderBoard.entity';
import { ChatModule } from './chat/chat.module';
import { Chat } from './chat/entities/chat.entity';
import { GameModule } from './game/game.module';
import { Friendship } from './user/entities/friendship.entity';
import { ChannelMsgs } from './chat/entities/channelmsgs.entity';
import { Channel } from './chat/entities/channel.entity';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserGateway } from './user/user.gateway';
import { UserGatewayModule } from './user/user.gateway.module';
import { Match } from './match/entities/match.entity';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { Notification } from './user/entities/notifications.entity';
import { NextFunction } from 'express';
import { promises as fs } from 'fs';

@Injectable()
export class AppMiddleware implements NestMiddleware {
  // constructor(private readonly jwtService: JwtService) {}
  use(req: Request, res: Response, next: Function) {
    // if (req.cookies.jwt) {
    //   this.jwtService.verify(req.cookies.jwt);
    // }
    setTimeout(() => {
      next();
    }, 0);
  }
}

@Injectable()
export class CustomFileNotFoundMiddleware implements NestMiddleware {
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }
  use(req: Request, res: Response, next: NextFunction) {
    const filePath = join('uploads', req.url);
    this.fileExists(filePath).then((exists) => {
      if (!exists) {
        console.log('File', filePath, 'not found');
        res.status(404).send({
          status: 404,
          message: 'File: uploads' + req.url + ' not found',
        });
      } else {
        next();
      }
    });
  }
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      // host: 'db',
      // username: 'postgres',
      // password: 'postgres',
      // database: 'postgres',
      // port: parseInt(process.env.POSTGRES_PORT),
      // type: 'sqlite',
      // database: 'db.sqlite',
      entities: [
        User,
        Matchhistory,
        LeaderBoard,
        Chat,
        Friendship,
        ChannelMsgs,
        Channel,
        Match,
        Notification,
      ],
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join('uploads'), // Specify the path to the uploads directory
      serveRoot: '/uploads', // Specify the base URL path to serve files from
    }),
    ConfigModule.forRoot(), // this is needed to use the .env file
    UsersModule,
    AuthModule,
    ChatModule,
    GameModule,
    UserGatewayModule,
    // PassportModule.register({ session: true }), // this is needed for the googleStrategy to work properly
  ],
  controllers: [],
  providers: [],
})
// export class AppModule {}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppMiddleware).forRoutes('user');
    consumer.apply(CustomFileNotFoundMiddleware).forRoutes('uploads');
  }
}
