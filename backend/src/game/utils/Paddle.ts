// const SPEED = 0.003; // easy
// const SPEED = 0.008; // meduim
// const SPEED = 0.01; // hard
const SPEED = 0.025; // almost impossible

type paddleSide = "left" | "right";

export type playerType = "AI" | "HUMANE";

export default class Paddle {
  paddleElement: HTMLDivElement;
  side: paddleSide;
  _type: playerType;

  constructor(
    paddleElement: HTMLDivElement,
    side: paddleSide,
    type: playerType
  ) {
    this.paddleElement = paddleElement;
    this.side = side;
    console.log(`paddle position::=> left: ${this.rect().left}`);
    this._type = type;
    this.reset();
  }

  get type(): playerType {
    return this._type;
  }

  set type(newValue: playerType) {
    this._type = newValue;
  }

  get position(): number {
    return parseInt(
      getComputedStyle(this.paddleElement).getPropertyValue("--paddle-pos")
    );
  }

  set position(newValue: number) {
    this.paddleElement.style.setProperty("--paddle-pos", newValue.toString());
  }

  reset() {
    this.position = 50;
  }

  rect() {
    return this.paddleElement.getBoundingClientRect();
  }

  update(ballPos: number, delta: number) {
    this.position += SPEED * delta * (ballPos - this.position);
  }
}
