import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';

@Injectable()
export class GameService {
  create(createGameDto: CreateGameDto) {
    return {
      id: Math.floor(Math.random() * 1000),
      idP1: createGameDto.player1SocketId,
      idP2: createGameDto.player2SocketId,
    };
  }

  getOpponentId(gameSocketMap: Map<number, any>, client: any) {
    const gameId = Array.from(gameSocketMap).find(([gameId, game]) => {
      gameId;
      return game.idP1 === client.id || game.idP2 === client.id;
    })?.[0];
    if (!gameId) {
      return null;
    }
    const game = gameSocketMap.get(gameId);
    return game.idP1 === client.id ? game.idP2 : game.idP1;
  }

  getRankAvatar(points: number) {
    if (points < 50) {
      return process.env.BACKEND_URL + '/uploads/ranks/1.png';
    } else if (points < 100) {
      return process.env.BACKEND_URL + '/uploads/ranks/2.png';
    } else if (points < 150) {
      return process.env.BACKEND_URL + '/uploads/ranks/3.png';
    } else if (points < 200) {
      return process.env.BACKEND_URL + '/uploads/ranks/4.png';
    }
    return process.env.BACKEND_URL + '/uploads/ranks/5.png';
  }

  // getRecieverSocketId(gameSocketMap: Map<number, any>, client: any) {}

  findAll() {
    return `This action returns all game`;
  }

  findOne(id: number) {
    return `This action returns a #${id} game`;
  }
}
