import Paddle from "./Paddle";

const GAME_SPEED = 0.025;
const GAME_SPEED_INCREASE = 0.005;

export default class {
  ballELement: HTMLDivElement;
  direction: { x: number; y: number };
  speed: number;
  gameRect: DOMRect;
  _delta: number;

  constructor(ballElement: HTMLDivElement, gameRect: DOMRect) {
    this.ballELement = ballElement;
    this.direction = { x: 0, y: 0 };
    this.speed = GAME_SPEED;
    this.gameRect = gameRect;
    this._delta = 0;
    this.reset();
  }

  get x(): number {
    return parseFloat(
      getComputedStyle(this.ballELement).getPropertyValue("--ball-x")
    );
  }

  set x(value: string) {
    this.ballELement.style.setProperty("--ball-x", value);
  }

  get y(): number {
    return parseFloat(
      getComputedStyle(this.ballELement).getPropertyValue("--ball-y")
    );
  }

  set y(value: string) {
    this.ballELement.style.setProperty("--ball-y", value);
  }

  reset() {
    this.x = "50";
    this.y = "50";
    this.direction.x = 0;
    this.speed = GAME_SPEED;
    while (
      Math.abs(this.direction.x) <= 0.4 ||
      Math.abs(this.direction.x) >= 0.6
    ) {
      const heading = Math.random() * (Math.PI * 2);
      this.direction = { x: Math.cos(heading), y: Math.sin(heading) };
    }
    //? testing edge problem
    // this.direction = { x: Math.cos(4.395), y: Math.sin(-1) };
  }

  rect() {
    return this.ballELement.getBoundingClientRect();
  }

  update(delta: number, paddlesRect: Paddle[]) {
    this._delta = delta;
    const ballPositionIncrementaion =
      (this.speed * this._delta * this.gameRect.width * this.direction.y) / 100;

    if (
      this.rect().top + ballPositionIncrementaion < this.gameRect.top ||
      this.rect().bottom + ballPositionIncrementaion > this.gameRect.bottom
    ) {
      this.direction.y *= -1;
    }
    if (paddlesRect.some((e) => this.isTapped(e, this.rect()))) {
      this.direction.x *= -1;
    }
    this.x = (+this.x + this.direction.x * this.speed * delta).toString();
    this.y = (+this.y + this.direction.y * this.speed * delta).toString();
  }

  private isTapped(paddle: Paddle, ball: DOMRect) {
    const paddleRect = paddle.rect();
    const ballPositionIncrementaion =
      (this.speed * this._delta * this.gameRect.width * this.direction.x) / 100;

    if (paddle.side === "left") {
      if (
        ball.left + ballPositionIncrementaion <= paddleRect.right &&
        ball.bottom <= paddleRect.bottom + 40 &&
        ball.top >= paddleRect.top - 40
      ) {
        this.speed += GAME_SPEED_INCREASE;
        return true;
      }
    }
    if (paddle.side === "right") {
      if (
        ball.right + ballPositionIncrementaion >= paddleRect.left &&
        ball.bottom <= paddleRect.bottom + 40 &&
        ball.top >= paddleRect.top - 40
      ) {
        this.speed += GAME_SPEED_INCREASE;
        return true;
      }
    }
    return false;
  }
}
