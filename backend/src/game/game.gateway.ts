import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { GameService } from './game.service';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { first, interval } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Match } from 'src/match/entities/match.entity';
import { watch } from 'fs';
import { flatten } from '@nestjs/common';

// interface gameEnvObj {
//   gameContainer: HTMLDivElement;
//   gameRec: DOMRect;
//   ball: Ball;
//   playerOnePaddle: Paddle;
//   playerTwoPaddle: Paddle;
// }

interface frameDataObj {
  ballX: number;
  ballY: number;
  ballXSpeed: number;
  ballYSpeed: number;
  Player1Paddle: number;
  Player2Paddle: number;
  player1Up: boolean;
  player1Down: boolean;
  player2Up: boolean;
  player2Down: boolean;
  intervalP1Id?: any;
  intervalP2Id?: any;
  player1Score?: number;
  player2Score?: number;
  over?: boolean;
  justHitThePaddle?: boolean;
  numberOfHits?: number;
}

export interface Game {
  idP1: string;
  idP2: string;
  player1Username: string;
  player2Username: string;
  lastScorer?: 'P1' | 'P2';
  stopGame?: boolean;
  justOneTimoutFlag?: boolean;
  timeout?: any;
  Params: frameDataObj;
  settings: customSettings;
}

export interface customSettings {
  active: boolean;
  scoreToWin: number;
  playerServes: 'Last scored' | 'defeated' | 'Random';
  serveDelay: number;
  invite?: {
    targetUsername: string;
    targetId: number;
    myUsername: string;
    myId: number;
  };
  playWithBot?: boolean;
  botLevel?: 'easy' | 'medium' | 'hard';
}

interface WaitingPlayer {
  socketId: string;
  setting: customSettings;
  isInvite?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  namespace: 'game',
})
export class GameGateway {
  constructor(
    private readonly gameService: GameService,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Match) private matchRepository: Repository<Match>,
  ) {
    this.gameLoop();
  }

  // map of gameId to socketId
  private readonly gameSocketMap = new Map<number, Game>();
  private readonly gameQueue = new Set<string>();
  private readonly waitingQueue = new Set<WaitingPlayer>();
  private readonly usersQueue = new Set<string>();

  private readonly defaultScoreToWin = 7;
  private readonly defaultPlayerServes = 'defeated';
  private readonly defaultServeDelay = 1;
  private stopGame = 0;
  private gameIsStoped = 0;

  @WebSocketServer()
  server: Server;

  slowDownBall(game: Game) {
    console.log('Slowing down the ball ...');
    game.Params.ballXSpeed *= 0.1;
    game.Params.ballYSpeed *= 0.1;
    this.gameIsStoped = 1;
  }

  stopTheGame(game: Game) {
    console.log('Stoping The game ...');
    console.log('game Params', game.Params);
    this.stopGame = 1;
  }

  async findOneByusername(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user?.username !== username) return undefined;
    return user;
  }

  async findOneById(id: number): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user?.id !== id) return undefined;
    return user;
  }

  async getUser(jwt: string) {
    if (!jwt) {
      console.log('no jwt');
      return null;
    }
    try {
      const payload = await this.jwtService.verify(jwt);
      const { password, ...user } = await this.findOneByusername(
        payload.username,
      );
      return user;
    } catch (e) {
      console.log('this is NOT valid jwt in /game : ', jwt, e.message);
      return null;
    }
  }

  getInfos(info) {
    if (!info) return;
    const scoreToWin =
      +info.scoreToWin < 3 ? 3 : +info.scoreToWin > 20 ? 20 : +info.scoreToWin;
    const playerServes = info.playerServes;
    const serveDelay =
      info.serveDelay === '1s' ? 1 : info.serveDelay === '2s' ? 2 : 0;
    return {
      scoreToWin,
      playerServes,
      serveDelay,
      invite: info.invite,
      active: info.active,
      playWithBot: info.playWithBot,
      botLevel: info.botLevel,
    };
  }

  waitersAreMatching(waiter1: WaitingPlayer, waiter2: WaitingPlayer) {
    let bool = false;
    if (waiter1.setting.invite && waiter2.setting.invite) {
      bool =
        waiter1.setting.invite.myId === waiter2.setting.invite.targetId &&
        waiter1.setting.invite.targetId === waiter2.setting.invite.myId;
      console.log('both waiters are from invite and they match', bool);
    } else if (waiter1.setting.invite || waiter2.setting.invite) {
      console.log('only one of the waiters are from the invite');
      return false;
    }

    return (
      bool ||
      !waiter1.setting.active ||
      !waiter2.setting.active ||
      (waiter1.setting.playerServes === waiter2.setting.playerServes &&
        waiter1.setting.scoreToWin === waiter2.setting.scoreToWin &&
        waiter1.setting.serveDelay === waiter2.setting.serveDelay)
    );
  }

  matcher() {
    const waitingArray = Array.from(this.waitingQueue);
    let result = { index1: -1, index2: -1, matchedInfo: null };
    let found = false;

    waitingArray.map((waiter1, index1) => {
      if (found) return;
      waitingArray.map((waiter2, index2) => {
        if (waiter1.socketId === waiter2.socketId) return;
        if (this.waitersAreMatching(waiter1, waiter2)) {
          result = {
            index1,
            index2,
            matchedInfo: waiter2.setting.active
              ? waiter2.setting
              : waiter1.setting,
          };
          found = true;
          this.waitingQueue.delete(waiter1);
          this.waitingQueue.delete(waiter2);
        }
      });
    });
    // console.log('wating queue', this.waitingQueue);
    return result;
  }

  async matchMakeWithBot(client, user, info) {
    console.log('matchMakeWithBot');
    const game = this.gameService.create({
      player1SocketId: client.id,
      player2SocketId: 'bot',
    });
    const { player1Displayname, player1Avatar } = await this.userRepository
      .findOne({
        where: { username: user.username },
      })
      .then((user) => ({
        player1Displayname: user.displayname,
        player1Avatar: user.avatar,
      }));
    const botUsername =
      info.botLevel === 'easy'
        ? 'bot1'
        : info.botLevel === 'medium'
          ? 'bot2'
          : 'bot3';
    const { player2Displayname, player2Avatar } = await this.userRepository
      .findOne({
        where: { username: botUsername },
      })
      .then((user) => ({
        player2Displayname: user.displayname,
        player2Avatar: user.avatar,
      }));
    this.gameSocketMap.set(game.id, {
      idP1: client.id,
      idP2: 'bot',
      player1Username: user.username,
      player2Username: 'bot',
      stopGame: false,
      justOneTimoutFlag: false,
      Params: {
        ballX: 50,
        ballY: 50,
        ballXSpeed: -0.3,
        ballYSpeed: 0.5,
        Player1Paddle: 50,
        Player2Paddle: 50,
        player1Up: false,
        player1Down: false,
        player2Up: false,
        player2Down: false,
        intervalP1Id: null,
        intervalP2Id: null,
        player1Score: 0,
        player2Score: 0,
        over: false,
        numberOfHits: 0,
      },
      settings: info,
    });
    this.matched(game, {
      player1Displayname,
      player1Avatar,
      player2Displayname,
      player2Avatar,
    });
    this.decidePlayer(client);
  }

  async matchMake(client, user, info) {
    if (this.usersQueue.has(user.username)) {
      console.log(
        '================================> already in the game queue',
      );
      return;
    }
    this.gameQueue.add(client.id);
    this.usersQueue.add(user.username);
    this.waitingQueue.add({ socketId: client.id, setting: info });
    const { index1, index2, matchedInfo } = this.matcher();
    const gameQueueArray = Array.from(this.gameQueue);
    const usersQueueArray = Array.from(this.usersQueue);
    console.log({ index1, index2, matchedInfo });
    if (index1 !== -1) {
      const game = this.gameService.create({
        player1SocketId: gameQueueArray[index1],
        player2SocketId: gameQueueArray[index2],
      });
      this.gameQueue.delete(gameQueueArray[index1]);
      this.gameQueue.delete(gameQueueArray[index2]);
      this.usersQueue.delete(usersQueueArray[index1]);
      this.usersQueue.delete(usersQueueArray[index2]);
      const { player1Displayname, player1Avatar } = await this.userRepository
        .findOne({
          where: { username: usersQueueArray[index1] },
        })
        .then((user) => ({
          player1Displayname: user.displayname,
          player1Avatar: user.avatar,
        }));
      const { player2Displayname, player2Avatar } = await this.userRepository
        .findOne({
          where: { username: usersQueueArray[index2] },
        })
        .then((user) => ({
          player2Displayname: user.displayname,
          player2Avatar: user.avatar,
        }));
      this.gameSocketMap.set(game.id, {
        idP1: gameQueueArray[index1],
        idP2: gameQueueArray[index2],
        player1Username: usersQueueArray[index1],
        player2Username: usersQueueArray[index2],
        stopGame: false,
        justOneTimoutFlag: false,
        Params: {
          ballX: 50,
          ballY: 50,
          ballXSpeed: -0.3,
          ballYSpeed: 0.5,
          Player1Paddle: 50,
          Player2Paddle: 50,
          player1Up: false,
          player1Down: false,
          player2Up: false,
          player2Down: false,
          intervalP1Id: null,
          intervalP2Id: null,
          player1Score: 0,
          player2Score: 0,
          over: false,
          numberOfHits: 0,
        },
        settings: matchedInfo,
      });
      this.matched(game, {
        player1Displayname,
        player1Avatar,
        player2Displayname,
        player2Avatar,
      });
      this.decidePlayer(client);
      console.log(
        'matched :',
        usersQueueArray[index1],
        usersQueueArray[index2],
      );
    } else console.log('no match !');
  }

  async handleConnection(client: any) {
    try {
      const token = client.handshake.auth?.token?.jwt;
      let info: customSettings = client.handshake.auth?.info;
      console.log('info', info);
      const invite = client.handshake.auth?.invite;
      if (!token) {
        console.log('no token {user not authenticated}  : ', token);
        return;
      }
      // invite && console.log('recieved an invite :', invite);
      if (!info) {
        console.log('using default game settings');
        info = {
          scoreToWin: this.defaultScoreToWin,
          playerServes: this.defaultPlayerServes,
          serveDelay: this.defaultServeDelay,
          active: false,
        };
      } else {
        console.log('recieved specefic game settings :', info);
        info = {
          ...info,
          active: true,
        };
      }
      info = {
        ...info,
        invite,
      };
      await this.getUser(token).then((user) => {
        if (!user) {
          console.log(
            "jwt is invalid, user can't be connected to the game socket",
          );
          return;
        }
        console.log(
          '\x1b[32mUser Connected to the game socket : \x1b[0m',
          user.username,
        );
        const infos = this.getInfos(info);
        if (infos.playWithBot) this.matchMakeWithBot(client, user, infos);
        else this.matchMake(client, user, infos);
      });
    } catch (error) {
      console.log('error', error);
    }
    console.log('gameQueue1', this.usersQueue);
  }

  async handleDisconnect(client: any) {
    console.log(` - - - > Client disconnected: ${client.id}`);
    const opponentId = this.gameService.getOpponentId(
      this.gameSocketMap,
      client,
    );
    if (!opponentId) console.log('opponent not found');
    const gameQueueArray = Array.from(this.gameQueue);
    gameQueueArray.forEach((game, i) => {
      if (game === client.id) {
        console.log('deleting on index:', i);
        this.gameQueue.delete(game);
        const usersArray = Array.from(this.usersQueue);
        this.usersQueue.delete(usersArray[i]);
      }
    });
    this.waitingQueue.forEach((waiter) => {
      if (waiter.socketId === client.id) this.waitingQueue.delete(waiter);
    });
    if (opponentId)
      this.gameSocketMap.forEach(async (game, gameId) => {
        if (game.idP1 === client.id || game.idP2 === client.id) {
          const scoreToWin = game.settings.scoreToWin;
          if (game.idP1 === client.id) {
            this.server.to(game.idP2).emit('gameOver', 'you won');
            this.server.to(game.idP1).emit('gameOver', 'you lost');
            this.updateUserScores(game.player2Username, game.player1Username, {
              ...game,
              Params: {
                ...game.Params,
                player1Score: 0,
                player2Score: scoreToWin,
              },
            });
          } else if (game.idP2 === client.id) {
            this.server.to(game.idP1).emit('gameOver', 'you won');
            this.server.to(game.idP2).emit('gameOver', 'you lost');
            this.updateUserScores(game.player1Username, game.player2Username, {
              ...game,
              Params: {
                ...game.Params,
                player1Score: scoreToWin,
                player2Score: 0,
              },
            });
          }
          this.gameSocketMap.delete(gameId);
        }
      });
    // this.server.to(opponentId).emit('opponentLeft', {});
    console.log('gameQueue2', this.usersQueue);
  }

  getGame(client: any) {
    return Array.from(this.gameSocketMap).find(([gameId, game]) => {
      gameId;
      return game.idP1 === client.id || game.idP2 === client.id;
    });
  }

  update(gameId: number, data: frameDataObj) {
    const game = this.gameSocketMap.get(gameId);
    game.Params = data;
    this.gameSocketMap.set(gameId, game);
  }

  gameLoop() {
    console.log(
      ' - - - - - - - - - - - - - gameLoop  - - - - - - - - - - - - - ',
    );
    console.log('there are ', this.gameSocketMap.size, ' games');
    interval(1000 / 50).subscribe(() => {
      this.gameSocketMap.forEach((game, gameId) => {
        if (game.stopGame === true && !game.justOneTimoutFlag) {
          game.justOneTimoutFlag = true;
          setTimeout(() => {
            game.stopGame = false;
            game.justOneTimoutFlag = false;
          }, game.settings.serveDelay * 1000);
          return;
        } else if (game.stopGame === true) return;
        if (game.Params.over) {
          this.gameSocketMap.delete(gameId);
          return;
        }
        this.moveBall(game);
        if (game.settings.playWithBot) this.botPaddleMover(game);
        this.movePaddle(game);
        this.server.to(game.idP1).emit('frame', game.Params);
        if (!game.settings.playWithBot)
          this.server.to(game.idP2).emit('frame', game.Params);
      });
    });
  }

  movePaddle(game: Game) {
    const paddle = game.Params;
    if (paddle.player1Up && paddle.Player1Paddle > 14)
      paddle.Player1Paddle -= 2;

    if (paddle.player1Down && paddle.Player1Paddle < 86)
      paddle.Player1Paddle += 2;

    if (paddle.player2Up && paddle.Player2Paddle > 14)
      paddle.Player2Paddle -= 2;

    if (paddle.player2Down && paddle.Player2Paddle < 86)
      paddle.Player2Paddle += 2;
  }

  async updateUserScores(winner: string, loser: string, game: Game) {
    if (game.settings.playWithBot) return;
    const winnerUser = await this.userRepository.findOne({
      where: { username: winner },
      relations: ['firstPlayerMatches', 'secondPlayerMatches'],
    });
    const loserUser = await this.userRepository.findOne({
      where: { username: loser },
      relations: ['firstPlayerMatches', 'secondPlayerMatches'],
    });
    const firstPlayer =
      winnerUser.username === game.player1Username ? winnerUser : loserUser;
    const secondPlayer =
      winnerUser.username === game.player2Username ? winnerUser : loserUser;
    console.log('creating match');
    const match = this.matchRepository.create({
      firstPlayer,
      secondPlayer,
      firstPlayerScore: game.Params.player1Score,
      secondPlayerScore: game.Params.player2Score,
      winnerUsername: winnerUser.username,
      loserUsername: loserUser.username,
    });

    // console.log('saving match', match);
    await this.matchRepository.save(match);

    firstPlayer.firstPlayerMatches.push(match);
    secondPlayer.secondPlayerMatches.push(match);

    if (winnerUser) {
      winnerUser.win += 1;
      winnerUser.points += 10;
      // winnerUser.matches.push(match);
      winnerUser.rankAvatar = this.gameService.getRankAvatar(winnerUser.points);
      await this.userRepository.save(winnerUser);
      // console.log('match saved!');
    }
    if (loserUser) {
      loserUser.lose += 1;
      loserUser.points -= 5;
      // loserUser.matches.push(match);
      loserUser.rankAvatar = this.gameService.getRankAvatar(loserUser.points);
      await this.userRepository.save(loserUser);
    }
  }

  emitLiveScore(game) {
    this.server.to(game.idP1).emit('liveScore', {
      player1Score: game.Params.player1Score,
      player2Score: game.Params.player2Score,
    });
    if (game.settings.playWithBot) return;
    this.server.to(game.idP2).emit('liveScore', {
      player1Score: game.Params.player1Score,
      player2Score: game.Params.player2Score,
    });
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  p1Serves(game: Game) {
    const zeroOrOne = Math.floor(Math.random() * 2);
    game.Params.ballXSpeed = -0.3;
    game.Params.ballYSpeed = zeroOrOne ? 0.5 : -0.5;
  }

  p2Serves(game: Game) {
    const zeroOrOne = Math.floor(Math.random() * 2);
    game.Params.ballXSpeed = 0.3;
    game.Params.ballYSpeed = zeroOrOne ? 0.5 : -0.5;
  }

  nextRound(game: Game) {
    game.Params.ballX = 50;
    game.Params.ballY = 50;
    game.Params.numberOfHits = 0;
    // await this.delay(1000);
    game.stopGame = true;
    game.Params.Player1Paddle = 50;
    game.Params.Player2Paddle = 50;
    if (game.settings.playerServes === 'Last scored') {
      if (game.lastScorer === 'P1') this.p1Serves(game);
      else this.p2Serves(game);
    } else if (game.settings.playerServes === 'defeated') {
      if (game.lastScorer === 'P1') this.p2Serves(game);
      else this.p1Serves(game);
    } else {
      const zeroOrOne = Math.floor(Math.random() * 2);
      if (zeroOrOne) this.p2Serves(game);
      else this.p1Serves(game);
    }
    this.gameIsStoped = 0;
  }

  ballSpeeder(ball) {
    if (++ball.numberOfHits < 8) {
      // console.log('ball speeder', ball.numberOfHits);
      ball.ballYSpeed += ball.ballYSpeed * 0.2;
      ball.ballXSpeed += ball.ballXSpeed * 0.2;
    }
    ball.ballXSpeed = -ball.ballXSpeed;
    ball.justHitThePaddle = true;
  }

  scoreUpdate(game: Game, scorer: 'P1' | 'P2') {
    if (scorer === 'P1') {
      game.Params.player1Score += 1;
    } else {
      game.Params.player2Score += 1;
    }
    game.lastScorer = scorer;
    console.log(
      scorer,
      'Just Scored :',
      game.Params.player1Score,
      '-',
      game.Params.player2Score,
    );
    this.emitLiveScore(game);
  }

  speedGenerator(diff, diffuculty: 'easy' | 'medium' | 'hard') {
    if (diffuculty === 'easy') {
      return 1;
    } else if (diffuculty === 'medium') {
      return diff / 10;
    } else {
      return diff / 5;
    }
  }

  botPaddleMover(game: Game) {
    const ball = game.Params;
    if (ball.ballX > 80 && ball.ballXSpeed > 0) {
      const diff = ball.Player2Paddle - ball.ballY;
      const speed = this.speedGenerator(Math.abs(diff), game.settings.botLevel);
      if (ball.ballY < ball.Player2Paddle) {
        if (ball.Player2Paddle > 14) ball.Player2Paddle -= speed;
      } else {
        if (ball.Player2Paddle < 86) ball.Player2Paddle += speed;
      }
    } else if (ball.ballXSpeed < 0) {
      if (ball.Player2Paddle < 50) {
        if (ball.Player2Paddle < 86)
          ball.Player2Paddle += this.speedGenerator(
            50 - ball.Player2Paddle,
            game.settings.botLevel,
          );
      }
      if (ball.Player2Paddle > 50) {
        if (ball.Player2Paddle > 14)
          ball.Player2Paddle -= this.speedGenerator(
            ball.Player2Paddle - 50,
            game.settings.botLevel,
          );
      }
    }
  }

  async moveBall(game: Game) {
    const ball = game.Params;

    // console.log('ballX', ball.ballX);

    if (
      Math.floor(ball.ballY + ball.ballYSpeed) >= 98 ||
      Math.floor(ball.ballY + ball.ballYSpeed) <= 2
    ) {
      ball.ballYSpeed = -ball.ballYSpeed;
    }

    if (ball.ballX > 98) {
      // check if ball is out of bounds
      this.scoreUpdate(game, 'P1');
      this.nextRound(game);
    } else if (ball.ballX < 2) {
      // check if ball is out of bounds
      this.scoreUpdate(game, 'P2');
      this.nextRound(game);
    } else if (
      Math.floor(ball.ballX) === 2 &&
      ball.ballY >= ball.Player1Paddle - 13 &&
      ball.ballY <= ball.Player1Paddle + 13 &&
      !ball.justHitThePaddle
    ) {
      console.log('P1 Hit The Ball', 'ballX:', ball.ballX);
      this.ballSpeeder(ball);
    } else if (
      Math.floor(ball.ballX) === 97 &&
      ball.ballY >= ball.Player2Paddle - 13 &&
      ball.ballY <= ball.Player2Paddle + 13 &&
      !ball.justHitThePaddle
    ) {
      console.log('P2 Hit The Ball', 'ballX:', ball.ballX);
      this.ballSpeeder(ball);
    } else if (
      (Math.floor(ball.ballX) < 5 || Math.floor(ball.ballX) > 95) &&
      !this.gameIsStoped
    ) {
      // this.slowDownBall(game);
    } else ball.justHitThePaddle = false;
    if (
      game.Params.player1Score === game.settings.scoreToWin ||
      game.Params.player2Score === game.settings.scoreToWin
    ) {
      game.Params.over = true;
      if (game.Params.player1Score === game.settings.scoreToWin) {
        this.server.to(game.idP1).emit('gameOver', 'you won');
        this.server.to(game.idP2).emit('gameOver', 'you lost');
        this.updateUserScores(game.player1Username, game.player2Username, game);
      } else {
        this.server.to(game.idP2).emit('gameOver', 'you won');
        this.server.to(game.idP1).emit('gameOver', 'you lost');
        this.updateUserScores(game.player2Username, game.player1Username, game);
      }
      console.log('game over and scores updated');
    }
    ball.ballX += ball.ballXSpeed;
    ball.ballY += ball.ballYSpeed;
  }

  matched(game: any, obj: any) {
    console.log('game', game);
    this.server.to(game.idP1).emit('matched', {
      player1socket: game.idP1,
      player2socket: game.idP2,
      playersInfo: obj,
    });
    this.server.to(game.idP2).emit('matched', {
      player1socket: game.idP1,
      player2socket: game.idP2,
      playersInfo: obj,
    });
  }

  @SubscribeMessage('keydown')
  keydown(client: any, key: any) {
    const game = this.getGame(client);
    // console.log('game is : ', game);
    if (!game) {
      // console.log('game not found');
      return;
    }
    const player1 = this.gameSocketMap.get(game[0]).idP1;
    const player2 = this.gameSocketMap.get(game[0]).idP2;
    if (client.id === player1) {
      // console.log('player1 pressed : ', key);
      if (key === 'w') {
        this.gameSocketMap.get(game[0]).Params.player1Up = true;
      } else if (key === 's') {
        this.gameSocketMap.get(game[0]).Params.player1Down = true;
      }
    } else {
      // console.log('player2 pressed : ', key);
      if (key === 'w') {
        this.gameSocketMap.get(game[0]).Params.player2Up = true;
      } else if (key === 's') {
        this.gameSocketMap.get(game[0]).Params.player2Down = true;
      }
    }
  }

  @SubscribeMessage('mouseMove')
  mouse(client: any, payload: number) {
    if (payload < 14) payload = 14;
    if (payload > 86) payload = 86;
    const game = this.getGame(client);
    // console.log(payload);
    // console.log('game is : ', game);
    if (!game) {
      // console.log('game not found');
      return;
    }
    const player1 = this.gameSocketMap.get(game[0]).idP1;
    if (client.id === player1) {
      this.gameSocketMap.get(game[0]).Params.Player1Paddle = payload;
    } else {
      this.gameSocketMap.get(game[0]).Params.Player2Paddle = payload;
    }
  }

  @SubscribeMessage('keyup')
  keyup(client: any, key: any) {
    const game = this.getGame(client);
    if (!game) {
      // console.log('game not found');
      return;
    }
    const player1 = this.gameSocketMap.get(game[0]).idP1;
    if (client.id === player1) {
      // console.log('player1 released : ', key);
      if (key === 'w') {
        this.gameSocketMap.get(game[0]).Params.player1Up = false;
      }
      if (key === 's') {
        this.gameSocketMap.get(game[0]).Params.player1Down = false;
      }
    } else {
      // console.log('player2 released : ', key);
      if (key === 'w') {
        this.gameSocketMap.get(game[0]).Params.player2Up = false;
      }
      if (key === 's') {
        this.gameSocketMap.get(game[0]).Params.player2Down = false;
      }
    }
  }

  @SubscribeMessage('move')
  move(client: any, payload: any) {
    const opponentId = this.gameService.getOpponentId(
      this.gameSocketMap,
      client,
    );
    // console.log(opponentId, ' moved : ', payload);
    this.server.to(opponentId).emit('move', payload);
  }

  @SubscribeMessage('sendInvite')
  invite(client: any, payload: any) {
    // const receiverId = this.
    // this.server.to(opponentId).emit('inviteRecieved', payload);
  }

  @SubscribeMessage('stop')
  stop(client: any, payload: any) {
    const opponentId = this.gameService.getOpponentId(
      this.gameSocketMap,
      client,
    );
    this.server.to(opponentId).emit('stop', payload);
  }

  @SubscribeMessage('ballAfterPause')
  ballAfterPause(client: any, payload: any) {
    const opponentId = this.gameService.getOpponentId(
      this.gameSocketMap,
      client,
    );
    this.server.to(opponentId).emit('ballAfterPause', payload);
  }

  @SubscribeMessage('decidePlayer')
  decidePlayer(client: any) {
    client;
    const clientGame = Array.from(this.gameSocketMap).find(([gameId, game]) => {
      gameId;
      return game.idP1 === client.id || game.idP2 === client.id;
    });

    if (clientGame) {
      const game = this.gameSocketMap.get(clientGame[0]);
      this.server.to(game.idP1).emit('decidePlayer', 'player1');
      this.server.to(game.idP2).emit('decidePlayer', 'player2');
    }
  }
}
